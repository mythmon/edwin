/**
 * BugStateStore holds a mapping of bugs to progress.
 *
 * Action responses:
 * - SET_RAW_PRS: Update the bug status.
 * - SET_RAW_BUGS: Update the bug status.
 */

import Immutable from 'immutable';
import TimelineDispatcher from '../dispatcher/TimelineDispatcher';
import BaseStore from '../utils/BaseStore';
import {ActionTypes, BugStates} from '../constants/TimelineConstants';
import BugStore from './BugStore';
import BugToPRStore from './BugToPRStore.js';

let bugStates = Immutable.Map();

class _BugStateStore extends BaseStore {
  get(bugId) {
    return bugStates.get(bugId);
  }

  getAll() {
    return bugStates;
  }
}

const BugStateStore = new _BugStateStore();

BugStateStore.dispatchToken = TimelineDispatcher.register((action) => {
  switch(action.type) {
    // Respond the same to both SET_RAW_PRS and SET_RAW_BUGS.
    case ActionTypes.SET_RAW_BUGS:
    case ActionTypes.SET_RAW_PRS:
      // Wait for both Bugs and the Bug-to-PR mappings to settle.
      TimelineDispatcher.waitFor([BugStore.dispatchToken, BugToPRStore.dispatchToken]);

      // Get all bug ids.
      let bugIds = new Immutable.Set(BugStore.getAll().map((bug) => bug.get('id')));

      bugStates = new Immutable.Map();

      BugStore.getAll().forEach((bug) => {
        const bugId = bug.get('id');
        let prs = BugToPRStore.get(bugId);

        if (bug.get('status') === 'RESOLVED') {
          bugStates = bugStates.set(bugId, BugStates.DONE);

        } else if (!prs.isEmpty() && prs.every((pr) => pr.get('merged'))) {
          // TODO: This will never fire, because we will only ever get open PRs.
          bugStates = bugStates.set(bugId, BugStates.MERGED);

        } else if (!prs.isEmpty()) {
          bugStates = bugStates.set(bugId, BugStates.IN_REVIEW);

        } else if (bug.get('assigned_to') !== 'nobody@mozilla.com' &&
                   bug.get('state') === 'ASSIGNED') {
          bugStates = bugStates.set(bugId, BugStates.STARTED);

        } else if (typeof bug.getIn(['whiteboard_parsed', 'p']) === 'number') {
          bugStates = bugStates.set(bugId, BugStates.READY);

        } else {
          bugStates = bugStates.set(bugId, BugStates.NOT_READY);
        }
      });

      BugStateStore.emitChange();
      break;

    default:
      // do nothing
  }
});


export default BugStateStore;
