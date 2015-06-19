import Immutable from 'immutable';

import TimelineDispatcher from '../dispatcher/TimelineDispatcher';
import * as TimelineConstants from '../constants/TimelineConstants';
import bzAPI from '../utils/bzAPI';
import githubAPI from '../utils/githubAPI.js';
import edwinAPI from '../utils/edwinAPI.js';


/**
 * Fetch bugs from the API, and dispatch an event to replace the bugs
 * in the store with the new bugs.
 * @param {Object} query Bugzilla API query.
 * @promises {undefined} Signals completion with no data.
 */
export function loadBugs(query) {
  return bzAPI.getBugs(query)
  .then(newBugs => {
    TimelineDispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_RAW_BUGS,
      newBugs,
    });

    return loadCommentTags(newBugs.map((bug) => bug.id));
  })
  // signal completion
  .then(() => undefined);
}

/**
 * Fetch PRs from the API, and dispatch an event to replace the PRs
 * in the store with the new PRs.
 * @param  {string} repo A repo name like "mythmon/edwin".
 * @promises {undefined} Signals completion with no data.
 */
export function loadPRs(repo) {
  return githubAPI.getPRs(repo)
  .then(newPRs => {
    TimelineDispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_RAW_PRS,
      newPRs,
    });
  })
  // signal completion
  .then(() => undefined);
}


/**
 * Fetch Teams from the API, and dispatch an event to replace the teams
 * in the store with the new ones.
 * @promise {undefined} Signals copmletion with no data.
 */
export function loadTeams() {
  return edwinAPI.getTeams()
  .then(newTeams => {
    TimelineDispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_RAW_TEAMS,
      newTeams,
    });
  })
  // signal completion
  .then(() => undefined);
}


/**
 * Get all comment tags for all `bugs`, and fire events for each.
 * @param {Array<Immutable.Map>} An array of immutable.js objects representing
 * the bugs to get comment tags for.
 */
export function loadCommentTags(bugIds) {
  return Promise.all(bugIds.map(bugId => (
    bzAPI.getBugComments(bugId)
    .then(comments => {
      let commentTags = new Immutable.Set();
      for (let comment of comments) {
        commentTags = commentTags.union(comment.tags);
      }
      return [bugId, commentTags.toJS()];
    })
  )))
  .then(bugIdsAndCommentTags => {
    TimelineDispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_COMMENT_TAGS,
      bugIdsAndCommentTags: bugIdsAndCommentTags
    });
  });
}


export default {
  loadBugs,
  loadPRs,
  loadTeams,
  loadCommentTags,
};
