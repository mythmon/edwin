/**
 * PRStore holds the state of all the GitHub pull requests in the system.
 *
 * Action responses:
 * - SET_RAW_PRS: Replaces the PR state with new PRs.
 */

import TimelineDispatcher from '../dispatcher/TimelineDispatcher';
import BaseStore from '../utils/BaseStore';
import TimelineConstants from '../constants/TimelineConstants';
import Immutable from 'immutable';
import * as parsers from '../utils/parsers';

let prs = Immutable.List();

class _PRStore extends BaseStore {
  /**
   * Get the current state of all PRs.
   *
   * @returns {Immutable.List} A list of all PRs.
   */
  getAll() {
    return prs;
  }
}

/**
 * Adds useful calculated fields to PRs.
 *
 * Fields added:
 * - bugs_referenced: A list of bugs mentioned in the PR.
 *
 * @param {Object} pr The pr to augment. Will be modified and returned.
 */
function augmentPR(pr) {
  pr.bugs_referenced = parsers.bugReferences.parse(pr.title);
  return pr;
}

const PRStore = new _PRStore();

PRStore.dispatchToken = TimelineDispatcher.register((action) => {
  switch(action.type) {
    case TimelineConstants.SET_RAW_BUGS:
      prs = Immutable.fromJS(action.newPRs.map(augmentPR));
      PRStore.emitChange();
      break;

    default:
      // do nothing
  }
});


export default PRStore;
