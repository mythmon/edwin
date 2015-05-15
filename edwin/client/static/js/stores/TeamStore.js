/**
 * TeamStore holds the state of all the Edwin teams in the system.
 *
 * Action responses:
 * - SET_RAW_TEAMS: Replaces the PR state with new PRs.
 */

import Immutable from 'immutable';

import TimelineDispatcher from '../dispatcher/TimelineDispatcher';
import BaseStore from '../utils/BaseStore';
import * as TimelineConstants from '../constants/TimelineConstants';

let teams = Immutable.List();

class _TeamStore extends BaseStore {
  /**
   * Get the current state of all PRs.
   * @returns {Immutable.List} A list of all PRs.
   */
  getAll() {
    return teams;
  }

  get(slug) {
    return teams.find((t) => t.get('slug') === slug);
  }
}

const TeamStore = new _TeamStore();

TeamStore.dispatchToken = TimelineDispatcher.register((action) => {
  switch(action.type) {
    case TimelineConstants.ActionTypes.SET_RAW_TEAMS:
      teams = Immutable.fromJS(action.newTeams);
      TeamStore.emitChange();
      break;

    default:
      // do nothing
  }
});

export default TeamStore;
