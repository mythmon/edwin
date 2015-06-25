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
import BaseStore from '../utils/BaseStore';
import {ActionTypes} from '../constants/UserConstants';

let storeData = Immutable.fromJS({
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
  switch(action.type) {
    case ActionTypes.USER_LOGIN:
      storeData = storeData
        .set('username', action.username)
        .set('apiKey', action.apiKey)
        .set('loggedIn', true);
      UserStore.emitChange();
      break;

    case ActionTypes.USER_LOGOUT:
      storeData = storeData
        .set('username', null)
        .set('apiKey', null)
        .set('loggedIn', false);
      UserStore.emitChange();
      break;

    default:
      // do nothing
  }
});

export default UserStore;
