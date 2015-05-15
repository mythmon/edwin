import 'whatwg-fetch';
import Immutable from 'immutable';
import * as TimelineActions from '../actions/TimelineActions';
import QueryStore from '../stores/QueryStore';
import BugStore from '../stores/BugStore';
import {buildUrl} from '../utils/urls';

const fetch = window.fetch;
const GITHUB_API = 'https://api.github.com';

/**
 * Make a call to the Github API.
 * @param {string} endpoint Endpoint to call, like '/repos'. Include a leading "/".
 * @param {Object} [params={}] Params to serialize into the querystring.
 * @returns {Promise.} A promise for a Fetch Response.
 */
function apiCall(endpoint, params={}) {
  let url = buildUrl(GITHUB_API, endpoint, params);
  return fetch(url, {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  })
  .then((response) => {
    if(!response.ok) {
      return new Promise((resolve, reject) => {
        response.json().then(reject);
      });
    } else {
      return response;
    }
  });
}


/**
 * Get PRs from GitHub and dispatch an action with the new PRs when the result
 * comes back.
 *
 * @param {string} repo Something like "user/repo".
 */
export function getPRs(repo) {
  let bugs = BugStore.getAll();

  apiCall(`/repos/${repo}/pulls`, {state: 'all'})
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .then((data) => TimelineActions.setPRs(data))
    // Don't return any data, just signal completion.
    .then(() => undefined);
}


export default {getPRs};
