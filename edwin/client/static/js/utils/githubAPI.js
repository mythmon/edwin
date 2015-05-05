import 'whatwg-fetch';
import Immutable from 'immutable';
import * as TimelineActions from '../actions/TimelineActions';
import QueryStore from '../stores/QueryStore';
import BugStore from '../stores/BugStore';
import {buildUrl} from '../utils/urls';

const fetch = window.fetch;
const GITHUB_API = 'https://api.github.com';
const REPO = 'mozilla/kitsune';

/**
 * Make a call to the Github API.
 * @param {string} endpoint Endpoint to call, like '/bug'. Don't include
 *   "/rest". Do in clude a leading "/".
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
 * Get bugs from Bugzilla using the current state of the QueryStore, and
 * dispatch an action with the new bugs when the result comes back.
 */
export function getPRs() {
  let bugs = BugStore.getAll();

  apiCall(`/repos/${REPO}/pulls`, {state: 'all'})
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .then((data) => TimelineActions.setPRs(data))
    .catch((err) => {
      console.error('Error updating PRs', err);
    });
}


export default {getPRs};
