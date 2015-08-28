import Immutable from 'immutable';

import Dispatcher from '../dispatcher';
import UserActionTypes from '../constants/UserActionTypes.js';
import UserStore from '../stores/UserStore.js';
import bzAPI from '../utils/bzAPI';
import Cacher from '../utils/Cacher.js';
import ProgressActions from '../actions/ProgressActions.js';


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
