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

import Dispatcher from '../dispatcher';
import BaseStore from '../utils/BaseStore';
import PRStore from './PRStore';
import {ActionTypes, BugStates} from '../constants/TimelineConstants';
import {whiteboardData} from '../utils/parsers';

let bugMap = Immutable.OrderedMap();

class _BugStore extends BaseStore {
  /**
   * Get the current state of all bugs.
   *
   * @returns {Immutable.List} A list of all bugs.
   */
  getAll() {
    // discard keys
    return bugMap.toList();
  }

  getTimelineBugs() {
    return bugMap.toList().filter(bug => (
      bug.get('sorted') &&
      bug.get('state') !== BugStates.NOT_READY &&
      bug.get('state') !== BugStates.DONE));
  }

  getUnsortedBugs() {
    return bugMap.toList().filter(bug => (
      !bug.get('sorted') &&
      bug.get('state') !== BugStates.NOT_READY &&
      bug.get('state') !== BugStates.DONE));
  }

  getNotReadyBugs() {
    return bugMap.toList().filter(bug => bug.get('state') === BugStates.NOT_READY);
  }
}

const BugStore = new _BugStore();

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

  // Store all the PRs that reference this bug.
  bug = bug.update('prs', (prs) => {
    if (prs === undefined) {
      prs = new Immutable.Set();
    }
    PRStore.getAll().forEach((pr) => {
      if (pr.get('bugsReferenced').contains(bug.get('id'))) {
        prs = prs.add(pr);
      }
    });
    return prs;
  });

  /* NB: bug.status comes from Bugzilla, and is RESOLVED, NEW, etc.
   * bug.state on the other hand comes from Edwin, and is one of {@link BugStates} */

  // If the bug is RESOLVED: DONE.
  if (bug.get('status') === 'RESOLVED') {
    bug = bug.set('state', BugStates.DONE);

  // If there are PRs, and every one is merged: MERGED.
  } else if (!bug.get('prs').isEmpty() && bug.get('prs').every((pr) => pr.get('state') === 'closed')) {
    bug = bug.set('state', BugStates.MERGED);

  // If there are PRs (and not all are merged): IN_REVIEW.
  } else if (!bug.get('prs').isEmpty()) {
    bug = bug.set('state', BugStates.IN_REVIEW);

  // If the bug is assigned and ASSIGNED: STARTED
  } else if (bug.get('status') === 'ASSIGNED' && bug.get('assigned_to') !== 'nobody@mozilla.org') {
    bug = bug.set('state', BugStates.STARTED);

  // If there is an estimate: READY.
  } else if (typeof bug.getIn(['whiteboardParsed', 'p']) === 'number') {
    bug = bug.set('state', BugStates.READY);

  // Otherwise: NOT_READY.
  } else {
    bug = bug.set('state', BugStates.NOT_READY);
  }

  for (let tag of bug.get('comment_tags', [])) {
    let match = /^edwin-after-(\d+)$/.exec(tag);
    if (match) {
      let id = parseInt(match[1]);
      bug = bug.update('after', new Immutable.List(), after => after.push(id));
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
        bug = bug.set('sorted', true);
        map.set(id, bug);
      }
    }
  });

  let unsorted = bugMap.filter((val, key) => !sorted.has(key));

  let count = 0;
  sorted = sorted.map(bug => bug.set('sorted', true).set('sortOrder', count++));
  unsorted = unsorted.map(bug => bug.set('sorted', false).set('sortOrder', null));

  bugMap = sorted.concat(unsorted);
}

BugStore.dispatchToken = Dispatcher.register((action) => {
  switch(action.type) {
    case ActionTypes.SET_RAW_BUGS:
      for (let bug of action.newBugs) {
        bugMap = bugMap.update(bug.id, new Immutable.Map(), (oldBug) => {
          let newBug = Immutable.fromJS(bug);
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
      for (let [bugId, commentId, commentTags] of action.bugIdsAndCommentIdsAndCommentTags) {
        bugMap = bugMap
          .setIn([bugId, 'comment_tags'], Immutable.fromJS(commentTags))
          .setIn([bugId, 'comment_zero_id'], commentId);
      }
      bugMap = bugMap.map(augmentBug);
      sortBugs();
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
        .setIn([action.bugId, 'sortOrder'], action.sortOrder)
        .setIn([action.bugId, 'sorted'], true);
      BugStore.emitChange();
      break;

    default:
      // do nothing
  }
});


export default BugStore;
