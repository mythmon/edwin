/**
 * BugStore holds the state of all the bugs in the system.
 *
 * Action responses:
 * - SET_RAW_BUGS: Replaces the bug state with new bugs. These bugs will be
 * 	 processed to add calculated fields, including PR references.
 * - SET_RAW_PRS: Wait for PRStore, and then update PR references.
 */

import Immutable from 'immutable';
import toposort from 'toposort';

import Dispatcher from '../dispatcher.js';
import BaseStore from '../utils/BaseStore.js';
import PRStore from './PRStore.js';
import TeamStore from './TeamStore.js';
import {ActionTypes, BugStates} from '../constants/TimelineConstants.js';
import {whiteboardData} from '../utils/parsers.js';

let bugMap = Immutable.OrderedMap();

class _BugStore extends BaseStore {
  /**
   * Get the current state of all bugs or bugs for a specified team.
   *
   * @param {String} teamSlug (Optional) Specified team.
   *
   * @returns {Immutable.List} A list of bugs.
   */
  getAll() {
    const teamSlug = TeamStore.getCurrentSlug();
    // discard keys
    return bugMap.toList()
      .filter(bug => bug.get('team') === teamSlug);
  }

  getTimelineBugs() {
    return this.getAll()
      .filter(bug => bug.get('sortOrder', null) !== null)
      .filter(bug => bug.get('state') !== BugStates.NOT_READY)
      .filter(bug => bug.get('state') !== BugStates.DONE);
  }

  getUnsortedBugs() {
    return this.getAll()
      .filter(bug => bug.get('sortOrder', null) === null)
      .filter(bug => bug.get('state') !== BugStates.NOT_READY)
      .filter(bug => bug.get('state') !== BugStates.DONE);
  }

  getNotReadyBugs() {
    return this.getAll()
      .filter(bug => bug.get('state') === BugStates.NOT_READY);
  }

  /**
   * Get set of ids of blocker bugs for visible bugs we don't have data for.
   *
   * @returns {Immutable.Set} A set of bug ids.
   */
  getBlockerBugIds() {
    const teamSlug = TeamStore.getCurrentSlug();
    let bugIds = Immutable.Set();
    let openBugs = bugMap.toList().filter(bug => (
      bug.get('team', '') === teamSlug &&
      bug.get('state', '') === BugStates.DONE));

    // Build a set of ids of all bugs in the depends_on field for bugs
    // that aren't completed.
    for (let bug of openBugs) {
      bugIds = bugIds.union(bug.get('depends_on'));
    }

    // Filter out the ids for bugs we already know about
    bugIds = bugIds.filter(id => !bugMap.has(id));

    return bugIds;
  }

  getMap() {
    return bugMap;
  }
}

const BugStore = new _BugStore();

function getBugState(bug) {
  // If the bug is RESOLVED: DONE.
  if (bug.get('status') === 'RESOLVED' || bug.get('status') === 'VERIFIED') {
    return BugStates.DONE;
  }

  // If there are PRs, and every one is closed and at least one is merged: MERGED.
  const prs = bug.get('prs', Immutable.List());
  if (!prs.isEmpty() &&
      prs.every(pr => pr.get('state') === 'closed') &&
      prs.some(pr => pr.get('merged_at') !== null)) {

    return BugStates.MERGED;
  }

  // If there are PRs (and not all are closed): IN_REVIEW.
  if (!prs.isEmpty() && prs.some(pr => pr.get('state') !== 'closed')) {
    return BugStates.IN_REVIEW;
  }

  // If the bug is assigned and status is ASSIGNED: STARTED
  if (bug.get('status') === 'ASSIGNED' && bug.get('assigned_to') !== 'nobody@mozilla.org') {
    return BugStates.STARTED;
  }

  // If there is an estimate: READY.
  if (typeof bug.getIn(['whiteboardParsed', 'p']) === 'number') {
    return BugStates.READY;
  }

  // Otherwise: NOT_READY.
  return BugStates.NOT_READY;
}

function getNeedinfo(bug) {
  // Filters the flags for needinfo flags.
  return bug.get('flags', new Immutable.List())
    .filter(flag => flag.get('name', '') === 'needinfo')
    .map(flag => {
      return {
        name: flag.get('requestee', 'Unknown').split('@')[0]
      };
    });
}

function getSecure(bug) {
  let groups = bug.get('groups');
  return (
    groups.contains('mozilla-employee-confidential') ||
    groups.contains('websites-security')
  );
}

/**
 * Adds useful calculated fields to bugs.
 *
 * Fields added:
 * - whiteboardParsed: If the bug's whiteboard matches
 *   {@link utils.whiteboard}'s expected grammar, this holds the parsed value.
 * - state: A state like DONE or READY.
 *
 * @param {Object} bug The bug to augment. Will be modified and returned.
 */
function augmentBug(bug) {
  // Parse the whiteboard field
  bug = bug.set('whiteboardParsed', Immutable.fromJS(whiteboardData.parse(bug.get('whiteboard', ''))));

  bug = bug.set('needinfo', getNeedinfo(bug));
  bug = bug.set('secure', getSecure(bug));

  // Store all the PRs that reference this bug.
  bug = bug.update('prs', (prs) => {
    if (prs === undefined) {
      prs = new Immutable.Map();
    }
    PRStore.getAll().forEach((pr) => {
      if (pr.get('bugsReferenced').contains(bug.get('id'))) {
        prs = prs.set(pr.get('id'), pr);
      }
    });
    return prs;
  });

  // Update the blocked field for this bug.
  bug = bug.set('blocked', bug.get('depends_on', Immutable.List())
    .map(bugId => bugMap.get(bugId))
    .filter(thisBug => (thisBug !== undefined && getBugState(thisBug) !== BugStates.DONE)));

  /* NB: bug.status comes from Bugzilla, and is RESOLVED, NEW, etc.
   * bug.state on the other hand comes from Edwin, and is one of {@link BugStates} */
  bug = bug.set('state', getBugState(bug));

  bug = bug.set('after', new Immutable.List());
  for (let tag of bug.get('comment_tags', new Immutable.Set())) {
    let match = /^edwin-after-(\d+)$/.exec(tag);
    if (match) {
      let id = parseInt(match[1]);
      bug = bug.update('after', after => after.push(id));
    }
  }

  return bug;
}

function sortBugs() {
  let edges = [];
  for (let bug of bugMap.toList()) {
    for (let afterBugId of bug.get('after', [])) {
      edges.push([bug.get('id'), afterBugId]);
    }
  }

  let sortedIds = toposort(edges).reverse();

  let sorted = new Immutable.OrderedMap().withMutations((map) => {
    for (let id of sortedIds) {
      let bug = bugMap.get(id);
      if (bug !== undefined) {
        map.set(id, bug);
      }
    }
  });

  let unsorted = bugMap.filter((val, key) => !sorted.has(key));

  let count = 0;
  sorted = sorted.map(bug => bug.set('sortOrder', count++));
  unsorted = unsorted.map(bug => bug.set('sortOrder', null));

  bugMap = sorted.concat(unsorted);
}

BugStore.dispatchToken = Dispatcher.register((action) => {
  switch (action.type) {
    case ActionTypes.SET_RAW_BUGS:
      for (let bug of action.newBugs) {
        bugMap = bugMap.update(bug.id, new Immutable.Map(), oldBug => {
          let newBug = Immutable.fromJS(bug);
          // FIXME: This doesn't allow for bugs to belong to multiple
          // teams.
          newBug = newBug.set('team', action.team);
          return augmentBug(oldBug.merge(newBug));
        });
      }
      sortBugs();
      BugStore.emitChange();
      break;

    case ActionTypes.SET_RAW_PRS:
      Dispatcher.waitFor([PRStore.dispatchToken]);
      bugMap = bugMap.map(augmentBug);
      BugStore.emitChange();
      break;

    case ActionTypes.SET_COMMENT_TAGS:
      for (let {bugId, commentId, tags} of action.commentSpecs) {
        bugMap = bugMap
          .setIn([bugId, 'comment_tags'], Immutable.fromJS(tags).toSet())
          .setIn([bugId, 'comment_zero_id'], commentId);
      }
      bugMap = bugMap.map(augmentBug);
      sortBugs();
      BugStore.emitChange();
      break;

    case ActionTypes.SET_BLOCKER_BUGS:
      // Merge newBugs into bugMap
      for (let bug of action.newBugs) {
        bugMap = bugMap.mergeIn([bug.id], Immutable.fromJS(bug));
      }

      // Need to update all the bugs
      bugMap = bugMap.map(augmentBug);
      BugStore.emitChange();
      break;

    case ActionTypes.ASSIGN_BUG:
      bugMap = bugMap
        .setIn([action.bugId, 'assigned_to'], action.assigned_to)
        .setIn([action.bugId, 'assigned_to_detail', 'email'], action.assigned_to)
        .setIn([action.bugId, 'assigned_to_detail', 'name'], action.assigned_to)
        .setIn([action.bugId, 'status'], 'ASSIGNED')
        .update(action.bugId, augmentBug);
      BugStore.emitChange();
      break;

    case ActionTypes.BUG_SET_INTERNAL_SORT:
      bugMap = bugMap
        .setIn([action.bugId, 'sortOrder'], action.sortOrder);
      BugStore.emitChange();
      break;

    case ActionTypes.BUGS_COMMIT_SORT_ORDER:
      // Remove all the after tags from all the bugs.
      for (let bug of BugStore.getAll()) {
        bugMap = bugMap.updateIn(
          [bug.get('id'), 'comment_tags'],
          new Immutable.Set(),
          comment_tags => comment_tags.filter(tag => !(/edwin-after-\d+/.exec(tag)))
        );
      }

      // Update all the after tags for sorted bugs.
      let prev = null;
      let sortedBugs = BugStore.getAll()
        .filter(bug => bug.get('sortOrder') !== null)
        .sortBy(bug => bug.get('sortOrder'));

      for (let bug of sortedBugs) {
        if (prev !== null) {
          bugMap = bugMap.updateIn(
            [bug.get('id'), 'comment_tags'],
            new Immutable.Set(),
            comment_tags => comment_tags.add(`edwin-after-${prev.get('id')}`)
          );
        }
        prev = bug;
      }

      bugMap = bugMap.map(augmentBug);
      sortBugs();
      BugStore.emitChange();

      break;

    default:
      // do nothing
  }
});


export default BugStore;
