import Immutable from 'immutable';

import Dispatcher from '../dispatcher';
import {ProgressActions} from '../actions/';
import {UserActionTypes} from '../constants/';
import {UserStore} from '../stores/';
import {bzAPI, Cacher} from '../utils/';

export function login(username, apiKey) {
  Dispatcher.dispatch({
    type: UserActionTypes.USER_LOGIN,
    username,
    apiKey,
    cache: {
      store: true,
    },
  });
}

export function logout() {
  Dispatcher.dispatch({
    type: UserActionTypes.USER_LOGOUT,
    cache: {
      invalidate: [UserActionTypes.USER_LOGIN],
    },
  });
}

export function restore() {
  ProgressActions.startTask('Restore user');
  if (UserStore.getAll().get('initialized')) {
    ProgressActions.endTask('Restore user');
    return Promise.resolve();
  } else {
    ProgressActions.endTask('Restore user');
    return Cacher.recallAction(UserActionTypes.USER_LOGIN)
    .then(() => {
      if (!UserStore.getAll().get('initialized')) {
        logout();
      }
    });
  }
}


export default {
  login,
  logout,
  restore
};
