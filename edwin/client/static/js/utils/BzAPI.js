import 'whatwg-fetch';
import * as TimelineActions from '../actions/TimelineActions';
import QueryStore from '../stores/QueryStore';
import {buildUrl} from '../utils/urls';

const fetch = window.fetch;
const BUGZILLA_API = 'https://bugzilla.mozilla.org/rest';


function apiCall(endpoint, params) {
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
