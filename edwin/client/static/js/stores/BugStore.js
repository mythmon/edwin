/**
 * BugStore holds the state of all the bugs in the system.
 *
 * Action responses:
 * - SET_RAW_BUGS: Replaces the bug state with new bugs. These bugs will be
 * 	 processed to add calculated fields, including PR references.
 * - SET_RAW_PRS: Wait for PRStore, and then update PR references.
 */

import Immutable from 'immutable';

import TimelineDispatcher from '../dispatcher/TimelineDispatcher';
import BaseStore from '../utils/BaseStore';
import PRStore from './PRStore';
import {ActionTypes, BugStates} from '../constants/TimelineConstants';
import {whiteboardData} from '../utils/parsers';

let bugs = Immutable.List();

class _BugStore extends BaseStore {
  /**
   * Get the current state of all bugs.
   *
   * @returns {Immutable.List} A list of all bugs.
   */
  getAll() {
    return bugs;
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
  bug = bug.set('whiteboardParsed', Immutable.fromJS(whiteboardData.parse(bug.get('whiteboard'))));

  // Store all the PRs that reference this bug.
  bug = bug.update('prs', (prs) => {
    if (prs === undefined) {
      prs = new Immutable.List();
    }
    PRStore.getAll().forEach((pr) => {
      if (pr.get('bugsReferenced').contains(bug.get('id'))) {
        prs = prs.push(pr);
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

  return bug;
}

function updateBugs() {
  let oldBugs = bugs;
  bugs = bugs.map(augmentBug);
  if (oldBugs !== bugs) {
    BugStore.emitChange();
  }
}

BugStore.dispatchToken = TimelineDispatcher.register((action) => {
  switch(action.type) {
    case ActionTypes.SET_RAW_BUGS:
      bugs = Immutable.fromJS(action.newBugs);
      updateBugs();
      break;

    case ActionTypes.SET_RAW_PRS:
      TimelineDispatcher.waitFor([PRStore.dispatchToken]);
      updateBugs();
      break;

    case ActionTypes.SET_BUG_COMMENT_TAGS:
      let [idx, ] = bugs.findEntry((bug) => bug.id === action.bugId);
      let commentTags = Immutable.fromJS(action.commentTags);
      bugs.updateIn([idx, 'comment_tags'], () => commentTags);
      BugStore.emitChange();
      break;

    default:
      // do nothing
  }
});


export default BugStore;
