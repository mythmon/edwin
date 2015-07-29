import Immutable from 'immutable';

import Dispatcher from '../dispatcher';
import UserConstants from '../constants/UserConstants.js';
import UserStore from '../stores/UserStore.js';
import bzAPI from '../utils/bzAPI';
import Cacher from '../utils/Cacher.js';


export function login(username, apiKey) {
  Dispatcher.dispatch({
    type: UserConstants.ActionTypes.USER_LOGIN,
    username,
    apiKey,
    cache: {
      store: true,
    },
  });
}

export function logout() {
  Dispatcher.dispatch({
    type: UserConstants.ActionTypes.USER_LOGOUT,
    cache: {
      invalidate: [UserConstants.ActionTypes.USER_LOGIN],
    },
  });
}

export function restore() {
  if (UserStore.getAll().get('initialized')) {
    return Promise.resolve();
  } else {
    return Cacher.recallAction(UserConstants.ActionTypes.USER_LOGIN)
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
