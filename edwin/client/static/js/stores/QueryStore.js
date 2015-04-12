import Immutable from 'immutable';
import TimelineDispatcher from '../dispatcher/TimelineDispatcher';
import TimelineConstants from '../constants/TimelineConstants';
import BaseStore from '../utils/BaseStore';

window.Immutable = Immutable;

let query = Immutable.Map();

class _QueryStore extends BaseStore {
  get() {
    return query;
  }
}

const QueryStore = new _QueryStore();

QueryStore.dispatchToken = TimelineDispatcher.register((action) => {
  switch(action.type) {
    case TimelineConstants.UPDATE_SEARCH:
      query = Immutable.Map(action.newVars);
      QueryStore.emitChange();
      break;

    default:
      // do nothing
  }
});

export default QueryStore;
