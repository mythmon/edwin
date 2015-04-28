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

      /* TODO: This doesn't handle bugs that are blocked, and it should.
       * Unfortunaty, that is probably going to require some sort of toposort,
       * since if bug A is blocked on bug B, and bug B is READY or better, it
       * is allowed for bug A to be READY as well. It is only the case that
       * bug A cannot be READY if bug B is NOT_READY.
       */

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
