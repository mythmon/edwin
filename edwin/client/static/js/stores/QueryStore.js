/**
 * QueryStore holds the state of the Bugzilla API query.
 *
 * Action responses:
 * - UPDATE_SEARCH: Adds values to or removes values from the query.
 */

import Immutable from 'immutable';
import TimelineDispatcher from '../dispatcher/TimelineDispatcher';
import * as TimelineConstants from '../constants/TimelineConstants';
import BaseStore from '../utils/BaseStore';

window.Immutable = Immutable;

let query = Immutable.Map();

class _QueryStore extends BaseStore {
  /**
   * Get the full query.
   * @returns {Object} Mapping of key/values for the Bugzilla search.
   */
  get() {
    return query;
  }
}

const QueryStore = new _QueryStore();

QueryStore.dispatchToken = TimelineDispatcher.register((action) => {
  switch(action.type) {
    case TimelineConstants.ActionTypes.UPDATE_SEARCH:
      query = Immutable.Map(action.newVars);
      QueryStore.emitChange();
      break;

    default:
      // do nothing
  }
});

export default QueryStore;
