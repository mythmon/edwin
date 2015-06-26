import Immutable from 'immutable';

import Dispatcher from '../dispatcher';
import * as TimelineConstants from '../constants/TimelineConstants';
import bzAPI from '../utils/bzAPI';
import githubAPI from '../utils/githubAPI.js';
import edwinAPI from '../utils/edwinAPI.js';
import BugStore from '../stores/BugStore.js';
import UserStore from '../stores/UserStore.js';


/**
 * Fetch bugs from the API, and dispatch an event to replace the bugs
 * in the store with the new bugs.
 * @param {Object} query Bugzilla API query.
 * @promises {undefined} Signals completion with no data.
 */
export function loadBugs(query) {
  return bzAPI.getBugs(query)
  .then(newBugs => {
    Dispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_RAW_BUGS,
      newBugs,
      cache: {
        store: true,
      },
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
    Dispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_RAW_PRS,
      newPRs,
      cache: {
        store: true,
      },
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
    Dispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_RAW_TEAMS,
      newTeams,
      cache: {
        store: true,
      },
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
      return [bugId, comments[0].id, comments[0].tags];
    })
  )))
  .then(bugIdsAndCommentIdsAndCommentTags => {
    Dispatcher.dispatch({
      type: TimelineConstants.ActionTypes.SET_COMMENT_TAGS,
      bugIdsAndCommentIdsAndCommentTags,
      cache: {
        store: true,
      },
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
    const oldCommentTags = oldBug.get('comment_tags').toSet();
    const newCommentTags = newBug.get('comment_tags').toSet();
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
