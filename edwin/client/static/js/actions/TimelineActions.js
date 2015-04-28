import TimelineDispatcher from '../dispatcher/TimelineDispatcher';
import * as TimelineConstants from '../constants/TimelineConstants';

/**
 * Updates fields in the bugzilla query.
 *
 * @param {Object.<string, string>} newVars Parameters to add.
 */
export function updateSearch(newVars) {
  TimelineDispatcher.dispatch({
    type: TimelineConstants.ActionTypes.UPDATE_SEARCH,
    newVars,
  });
}


/**
 * Replace the current set of bugs with `newBugs`, which are raw from the API.
 * @param {Array} newBugs Bug descriptions from the Bugzilla API.
 */
export function setBugs(newBugs) {
  TimelineDispatcher.dispatch({
    type: TimelineConstants.ActionTypes.SET_RAW_BUGS,
    newBugs,
  });
}


export function setPRs(newPRs) {
  TimelineDispatcher.dispatch({
    type: TimelineConstants.ActionTypes.SET_RAW_PRS,
    newPRs,
  });
}
