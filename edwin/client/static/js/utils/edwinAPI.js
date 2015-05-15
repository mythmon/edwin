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
      return response;
    }
  });
}


/**
 * Get all teams from Edwin, and dispatch an action with the new teams when the
 * result comes back.
 */
export function getTeams() {
  return apiCall('/teams/')
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .then((data) => TimelineActions.setTeams(data))
    .catch((err) => {
      console.error('Error updating Teams', err);
    });
}

export default {getTeams};
