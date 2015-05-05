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


/**
 * Replace the current set of PRs with `newPRs`, which are raw from the API.
 * @param {Array} newPRs PR descriptions from the GitHub API.
 */
export function setPRs(newPRs) {
  TimelineDispatcher.dispatch({
    type: TimelineConstants.ActionTypes.SET_RAW_PRS,
    newPRs,
  });
}


/**
 * Replace the current set of Teams with `newTeams`, which are raw from the API.
 * @param {Array} newTeams Team descriptions from the Edwin API.
 */
export function setTeams(newTeams) {
  TimelineDispatcher.dispatch({
    type: TimelineConstants.ActionTypes.SET_RAW_TEAMS,
    newTeams,
  });
}
