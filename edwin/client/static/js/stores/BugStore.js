/**
 * BugStore holds the state of all the bugs in the system.
 *
 * Action responses:
 * - SET_RAW_BUGS: Replaces the bug state with new bugs. These bugs will be
 * 	 processed to add calculated fields.
 */

import TimelineDispatcher from '../dispatcher/TimelineDispatcher';
import BaseStore from '../utils/BaseStore';
import TimelineConstants from '../constants/TimelineConstants';
import {List} from 'immutable';
import * as whiteboard from '../utils/whiteboard';

let bugs = List();

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

/**
 * Adds useful calculated fields to bugs.
 *
 * Fields added:
 * - whiteboard_parsed: If the bug's whiteboard matches
 *   {@link utils.whiteboard}'s expected grammar, this holds the parsed value.
 *
 * @param {Object} bug The bug to augment. Will be modified and returned.
 */
function augmentBug(bug) {
  try {
    bug.whiteboard_parsed = whiteboard.grammar.parse(bug.whiteboard);
  } catch(e) {
    bug.whiteboard_parsed = null;
  }
  return bug;
}

const BugStore = new _BugStore();

BugStore.dispatchToken = TimelineDispatcher.register((action) => {
  switch(action.type) {
    case TimelineConstants.SET_RAW_BUGS:
      bugs = List(action.newBugs.map(augmentBug));
      BugStore.emitChange();
      break;

    default:
      // do nothing
  }
});


export default BugStore;
