import Immutable from 'immutable';

import Dispatcher from '../dispatcher';
import TimelineConstants from '../constants/TimelineConstants';
import bzAPI from '../utils/bzAPI';
import githubAPI from '../utils/githubAPI.js';
import edwinAPI from '../utils/edwinAPI.js';
import BugStore from '../stores/BugStore.js';
import UserStore from '../stores/UserStore.js';
import PromiseExt from '../utils/PromiseExt.js';
import ProgressActions from '../actions/ProgressActions.js';


/**
 * Fetch bugs from the API, and dispatch an event to replace the bugs
 * in the store with the new bugs.
 * @param {Object} query Bugzilla API query.
 * @promises {undefined} Signals completion with no data.
 */
export function loadBugs(query) {
  const user = UserStore.getAll();

  ProgressActions.startTask('Load bugs');

  if (user.get('loggedIn')) {
    query.api_key = user.get('apiKey');
  }

  return bzAPI.getBugs(query)
  .then(newBugs => {
    Dispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_RAW_BUGS,
      newBugs,
    });

    let idsForCommentTags = BugStore.getAll()
      .filter(bug => bug.get('state') !== TimelineConstants.BugStates.NOT_READY)
      .map(bug => bug.get('id'));

    return loadCommentTags(idsForCommentTags);
  })
  .then(() => ProgressActions.endTask('Load bugs'))
  // signal completion
  .then(() => undefined);
}

/**
 * Fetch PRs from the API, and dispatch an event to replace the PRs
 * in the store with the new PRs.
 * @param  {string} repo A repo name like "mythmon/edwin".
 * @promises {undefined} Signals completion with no data.
 */
export function loadPRs(repos) {
  ProgressActions.startTask('Load PRs');
  Promise.all(repos.map(repo => githubAPI.getPRs(repo)))
  .then(prLists => {
    let flattened = [];
    for (let prList of prLists) {
      flattened = flattened.concat(prList);
    }
    Dispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_RAW_PRS,
      newPRs: flattened,
    });
  })
  .then(() => ProgressActions.endTask('Load PRs'))
  // signal completion
  .then(() => undefined);
}


/**
 * Fetch Teams from the API, and dispatch an event to replace the teams
 * in the store with the new ones.
 * @promise {undefined} Signals copmletion with no data.
 */
export function loadTeams() {
  ProgressActions.startTask('Load teams');
  return edwinAPI.getTeams()
  .then(newTeams => {
    Dispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_RAW_TEAMS,
      newTeams,
    });
  })
  .then(() => ProgressActions.endTask('Load teams'))
  // signal completion
  .then(() => undefined);
}


/**
 * Get all comment tags for all `bugs`, and fire events for each.
 * @param {Array<Immutable.Map>} An array of immutable.js objects representing
 * the bugs to get comment tags for.
 */
export function loadCommentTags(bugIds) {
  let params = {};

  const user = UserStore.getAll();
  if (user.get('loggedIn')) {
    params.api_key = user.get('apiKey');
  }

  let commentPromises = bugIds.map(bugId => (
    bzAPI.getBugComments(bugId, params)
    .then(comments => {
      return {bugId, commentId: comments[0].id, tags: comments[0].tags};
    })
  )).toJS();

  return PromiseExt.allResolves(commentPromises)
  .then(commentSpecs => {
    Dispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_COMMENT_TAGS,
      commentSpecs,
    });
  });
}


export function grabBug(bugId) {
  const user = UserStore.getAll();

  if (!user.get('loggedIn')) {
    throw new Error("Can't grab bugs without being loggd in.");
  }

  const assigned_to = user.get('username');
  const api_key = user.get('apiKey');

  bzAPI.modifyBug(bugId, {
    status: 'ASSIGNED',
    assigned_to,
    api_key,
  })
  .then(() => {
    Dispatcher.dispatch({
      type: TimelineConstants.ActionTypes.ASSIGN_BUG,
      assigned_to,
      bugId,
    });
  });
}

export function setInternalSort(bugId, sortOrder) {
  Dispatcher.dispatch({
    type: TimelineConstants.ActionTypes.BUG_SET_INTERNAL_SORT,
    bugId,
    sortOrder,
  });
}

export function commitSortOrder() {
  const user = UserStore.getAll();
  if (!user.get('loggedIn')) {
    throw new Error("Can't sort bugs without being loggd in.");
  }
  const apiKey = user.get('apiKey');

  const oldBugMap = BugStore.getMap();
  Dispatcher.dispatch({
    type: TimelineConstants.ActionTypes.BUGS_COMMIT_SORT_ORDER,
  });

  /* `dispatch` is syncronous, so all the bugs have correct comment tags
   * now to represent the order they should be in. Compare the new comment
   * tags with the old comment tags, and commit any diffs to the server.
   * This would be easier if we could just directly update the comment
   * tags, but the bugzilla API doesn't work that way.
   */
  let promises = [];
  const newBugMap = BugStore.getMap();

  for (let [bugId, oldBug] of oldBugMap) {
    const newBug = newBugMap.get(bugId);
    const oldCommentTags = oldBug.get('comment_tags', new Immutable.Set());
    const newCommentTags = newBug.get('comment_tags', new Immutable.Set());
    const toAdd = newCommentTags.subtract(oldCommentTags);
    const toRemove = oldCommentTags.subtract(newCommentTags);

    if (toRemove.count() > 0 || toAdd.count() > 0) {
      promises.push(bzAPI.updateCommentTags({
        commentId: oldBug.get('comment_zero_id'),
        add: toAdd.toJS(),
        remove: toRemove.toJS(),
        apiKey,
      }));
    }
  }

  return Promise.all(promises);
}


export default {
  loadBugs,
  loadPRs,
  loadTeams,
  loadCommentTags,
  grabBug,
  setInternalSort,
  commitSortOrder,
};
