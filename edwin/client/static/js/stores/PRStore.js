/**
 * PRStore holds the state of all the GitHub pull requests in the system.
 *
 * Action responses:
 * - SET_RAW_PRS: Replaces the PR state with new PRs, and then update PR
 *   references.
 * - SET_RAW_BUGS: Wait for BugStore, and then update PR references..
 */

import Immutable from 'immutable';

import Dispatcher from '../dispatcher';
import BaseStore from '../utils/BaseStore';
import BugStore from './BugStore';
import * as TimelineConstants from '../constants/TimelineConstants';
import {bugReferences} from '../utils/parsers';

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

const PRStore = new _PRStore();

/**
 * Adds useful calculated fields to PRs.
 *
 * Fields added:
 * - bugsReferenced: A list of bugs mentioned in the PR.
 *
 * @param {Object} pr The pr to augment. Will be modified and returned.
 */
function augmentPR(pr) {
  pr = pr.set('bugsReferenced', Immutable.fromJS(bugReferences.parse(pr.get('title'))));
  return pr;
}

function update() {
  let oldPRs = prs;
  prs = prs.map(augmentPR);
  if (oldPRs !== prs) {
    PRStore.emitChange();
  }
}

PRStore.dispatchToken = Dispatcher.register((action) => {
  switch(action.type) {
    case TimelineConstants.ActionTypes.SET_RAW_PRS:
      prs = Immutable.fromJS(action.newPRs).map(augmentPR);
      update();
      break;

    case TimelineConstants.ActionTypes.SET_RAW_BUGS:
      Dispatcher.waitFor([BugStore.dispatchToken]);
      update();
      break;

    default:
      // do nothing
  }
});


export default PRStore;
