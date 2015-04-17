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
import TimelineConstants from '../constants/TimelineConstants';
import BugStore from './BugStore';
import PRStore from './PRStore';
import * as parsers from '../utils/parsers';

let bugToPRs = Immutable.Map();

class _BugToPRStore extends BaseStore {
  /**
   * Get the current state of all PRs.
   *
   * @param {Number} bug_id The Id of the bug to fetch PRs for.
   * @returns {Ojbect} A PR.
   */
  prsFor(bug_id) {
    return bugToPRs.get(bug_id);
  }
}

const BugToPRStore = new _BugToPRStore();

BugToPRStore.dispatchToken = TimelineDispatcher.register((action) => {
  switch(action.type) {
    // Respond the same to both SET_RAW_PRS and SET_RAW_BUGS.
    case TimelineConstants.SET_RAW_BUGS:
    case TimelineConstants.SET_RAW_PRS:
      // Wait for both Bugs and PRs to settle.
      TimelineDispatcher.waitFor([BugStore.dispatchToken, PRStore.dispatchToken]);
      // Get all bug ids.
      let bugIds = new Immutable.Set(BugStore.getAll().map((bug) => bug.get('id')));

      // Make a map of bug ids to a list of PRs that reference them.
      bugToPRs = new Immutable.Map().withMutations(map => {
        bugIds.forEach((bugId) => map.set(bugId, new Immutable.List()));

        // For each PR
        for (let pr of PRStore.getAll()) {
          // For every bug in that PR
          for (let bugId of pr.get('bugs_referenced')) {
            // If it is in BugStore
            if (bugIds.contains(bugId)) {
              // Add an entry to bugToPRs
              map.update(bugId, (prList) => prList.push(pr));
            }
          }
        }
      });

      BugToPRStore.emitChange();
      break;

    default:
      // do nothing
  }
});


export default BugToPRStore;
