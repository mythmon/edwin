/**
 * BugStore holds the state of all the bugs in the system.
 *
 * Action responses:
 * - SET_RAW_BUGS: Replaces the bug state with new bugs. These bugs will be
 * 	 processed to add calculated fields, including PR references.
 * - SET_RAW_PRS: Wait for PRStore, and then update PR references.
 */

import Immutable from 'immutable';

import Dispatcher from '../dispatcher';
import {UserActionTypes} from '../constants/';

// For some reason, this can't use the normal import pattern.
import BaseStore from '../utils/BaseStore.js';

let storeData = Immutable.fromJS({
  initialized: false,
  username: null,
  apiKey: null,
  loggedIn: false,
});

class _UserStore extends BaseStore {
  getAll() {
    return storeData;
  }
}

const UserStore = new _UserStore();

UserStore.dispatchToken = Dispatcher.register((action) => {
  switch (action.type) {
    case UserActionTypes.USER_LOGIN:
      storeData = storeData
        .set('username', action.username)
        .set('apiKey', action.apiKey)
        .set('loggedIn', true)
        .set('initialized', true);
      UserStore.emitChange();
      break;

    case UserActionTypes.USER_LOGOUT:
      storeData = storeData
        .set('username', null)
        .set('apiKey', null)
        .set('loggedIn', false)
        .set('initialized', true);
      UserStore.emitChange();
      break;

    default:
      // do nothing
  }
});

export default UserStore;
