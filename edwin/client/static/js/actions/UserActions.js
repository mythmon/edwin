import Immutable from 'immutable';

import Dispatcher from '../dispatcher';
import UserConstants from '../constants/UserConstants.js';
import bzAPI from '../utils/bzAPI';


export function login(username, apiKey) {
  Dispatcher.dispatch({
    type: UserConstants.ActionTypes.USER_LOGIN,
    username,
    apiKey,
  });
}

export function logout() {
  Dispatcher.dispatch({
    type: UserConstants.ActionTypes.USER_LOGOUT,
  });
}


export default {
  login,
  logout,
};
