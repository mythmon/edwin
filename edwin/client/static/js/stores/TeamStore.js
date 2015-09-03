/**
 * TeamStore holds the state of all the Edwin teams in the system.
 *
 * Action responses:
 * - SET_RAW_TEAMS: Replaces the PR state with new PRs.
 */

import Immutable from 'immutable';

import Dispatcher from '../dispatcher';
import {TimelineActionTypes} from '../constants/';

// For some reason, this can't use the normal import pattern.
import BaseStore from '../utils/BaseStore.js';

let teams = Immutable.Map();
let currentSlug = null;

class _TeamStore extends BaseStore {
  /**
   * Get the current state of all PRs.
   * @returns {Immutable.List} A list of all PRs.
   */
  getAll() {
    return teams.toList();
  }

  get(slug) {
    return teams.get(slug);
  }

  getCurrentTeam() {
    return teams.get(currentSlug);
  }

  getCurrentSlug() {
    return currentSlug;
  }
}

const TeamStore = new _TeamStore();

TeamStore.dispatchToken = Dispatcher.register((action) => {
  switch (action.type) {
    case TimelineActionTypes.SET_RAW_TEAMS:
      let newTeams = Immutable.fromJS(action.newTeams);
      for (let team of newTeams) {
        teams = teams.set(team.get('slug'), team);
      }
      TeamStore.emitChange();
      break;

    case TimelineActionTypes.SET_CURRENT_TEAM:
      currentSlug = action.slug;
      TeamStore.emitChange();
      break;

    default:
      // do nothing
  }
});

export default TeamStore;
