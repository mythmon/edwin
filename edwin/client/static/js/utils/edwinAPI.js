import 'whatwg-fetch';
import Immutable from 'immutable';
import * as TimelineActions from '../actions/TimelineActions';
import {buildUrl} from '../utils/urls';

const fetch = window.fetch;

/**
 * Make a call to the Edwin API.
 * @param {string} endpoint Endpoint to call, like '/teams/'. Include a leading "/".
 * @param {Object} [params={}] Params to serialize into the querystring.
 * @returns {Promise.} A promise for a Fetch Response.
 */
function apiCall(endpoint, params={}) {
  let url = buildUrl('/api', endpoint, params);
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
      return response.json();
    }
  });
}


/**
 * Get all teams from Edwin.
 */
export function getTeams() {
  return apiCall('/teams/');
}

export default {getTeams};
