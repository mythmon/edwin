import 'whatwg-fetch';
import Immutable from 'immutable';
import * as TimelineActions from '../actions/TimelineActions';
import {buildUrl} from '../utils/urls';

const fetch = window.fetch;
const BUGZILLA_API = 'https://bugzilla.mozilla.org/rest';
const fields = [
  'assigned_to',
  'blocks',
  'depends_on',
  'id',
  'last_change_time',
  'priority',
  'resolution',
  'status',
  'summary',
  'whiteboard',
];

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
 * Get bugs from Bugzilla, and dispatch an action with the new bugs when the
 * result comes back.
 *
 * @resolves {undefined} Resolves when the API call is done.
 * @rejects {Error} Rejects with any API errors.
 */
export function getBugs(query) {
  let defaults = Immutable.Map({
    include_fields: fields.join(','),
  });

  let params = defaults.merge(Immutable.fromJS(query));

  return apiCall('/bug', params.toJS())
    .then((response) => response.json())
    .then((data) => TimelineActions.setBugs(data.bugs))
    // Don't return any data, just signal completion.
    .then(() => undefined);
}


export default {getBugs};
