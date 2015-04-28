/**
 * BugToPRStore holds a mapping of bug IDs to PRs.
 *
 * Action responses:
 * - SET_RAW_PRS: Update the bug -> PR mapping.
 * - SET_RAW_BUGS: Update the bug -> PR mapping.
 */

import Immutable from 'immutable';
import TimelineDispatcher from '../dispatcher/TimelineDispatcher';
import BaseStore from '../utils/BaseStore';
import * as TimelineConstants from '../constants/TimelineConstants';
import BugStore from './BugStore';
import PRStore from './PRStore';
import * as parsers from '../utils/parsers';

let bugToPRs = Immutable.Map();

class _BugToPRStore extends BaseStore {
  /**
   * Get the list of PRs that reference a bug.
   *
   * @param {Number} bugId The Id of the bug to fetch PRs for.
   * @returns {Array.<Object>} All the PRs that reference {@link bugId}.
   */
  get(bugId) {
    return bugToPRs.get(bugId, new Immutable.List());
  }

  /**
   * Get the full Bug->PR mapping.
   *
   * @returns {Immutable.Map}
   */
  getAll() {
    return bugToPRs;
  }
}

const BugToPRStore = new _BugToPRStore();

BugToPRStore.dispatchToken = TimelineDispatcher.register((action) => {
  switch(action.type) {
    // Respond the same to both SET_RAW_PRS and SET_RAW_BUGS.
    case TimelineConstants.ActionTypes.SET_RAW_BUGS:
    case TimelineConstants.ActionTypes.SET_RAW_PRS:
      // Wait for both Bugs and PRs to settle.
      TimelineDispatcher.waitFor([BugStore.dispatchToken, PRStore.dispatchToken]);

      // Get all bug ids.
      let bugIds = new Immutable.Set(BugStore.getAll().map((bug) => bug.get('id')));

      // Make a map of bug ids to a list of PRs that reference them.
      bugToPRs = new Immutable.Map();
      bugIds.forEach((bugId) => bugToPRs.set(bugId, new Immutable.List()));

      // For each PR
      for (let pr of PRStore.getAll()) {
        // For every bug in that PR
        for (let bugId of pr.get('bugs_referenced')) {
          // Add an entry to bugToPRs
          bugToPRs = bugToPRs.update(bugId, new Immutable.List(), (prList) => prList.push(pr));
        }
      }

      BugToPRStore.emitChange();
      break;

    default:
      // do nothing
  }
});


export default BugToPRStore;
