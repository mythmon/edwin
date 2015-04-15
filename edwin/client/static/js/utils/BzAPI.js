import 'whatwg-fetch';
import * as TimelineActions from '../actions/TimelineActions';
import QueryStore from '../stores/QueryStore';
import {buildUrl} from '../utils/urls';

const fetch = window.fetch;
const BUGZILLA_API = 'https://bugzilla.mozilla.org/rest';


/**
 * Make a call to the Bugzilla API.
 * @param {string} endpoint Endpoint to call, like '/bug'. Don't include
 *   "/rest". Do in clude a leading "/".
 * @param {Object} [params={}] Params to serialize into the querystring.
 * @returns {Promise.} A promise for a Fetch Response.
 */
function apiCall(endpoint, params={}) {
  let url = buildUrl(BUGZILLA_API, endpoint, params);
  return fetch(url, {
    // mode: 'cors',
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
export function getBugs() {
  apiCall('/bug', QueryStore.get().toJS())
    .then((response) => response.json())
    .catch((err) => {
      console.error('Error fetching bugs', err);
    })
    .then((data) => TimelineActions.setBugs(data.bugs))
    .catch((err) => {
      console.error('Error updating bugs', err);
    });
}


QueryStore.addChangeListener(getBugs);
