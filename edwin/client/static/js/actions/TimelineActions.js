import Immutable from 'immutable';

import TimelineDispatcher from '../dispatcher/TimelineDispatcher';
import * as TimelineConstants from '../constants/TimelineConstants';
import bzAPI from '../utils/bzAPI';

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
  getCommentTags(newBugs.map((bug) => bug.id));
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


/**
 * Get all comment tags for all `bugs`, and fire events for each.
 * @param {Array<Immutable.Map>} An array of immutable.js objects representing
 * the bugs to get comment tags for.
 */
export function getCommentTags(bugIds) {
  for (let bugId of bugIds) {
    bzAPI.getBugComments(bugId)
    .then((comments) => {
      let commentTags = new Immutable.Set();
      for (let comment of comments) {
        commentTags = commentTags.union(comment.tags);
      }
      TimelineDispatcher.dispatch({
        type: TimelineConstants.ActionTypes.SET_BUG_COMMENT_TAGS,
        commentTags: commentTags.toJS(),
        bugId: bugId,
      });
    })
    .catch((err) => console.error('uh oh!', err));
  }
}
