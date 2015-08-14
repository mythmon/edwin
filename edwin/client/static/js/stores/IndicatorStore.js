/**
 * Indicator store holds the current data loading state.
 */

import Immutable from 'immutable';

import Dispatcher from '../dispatcher';
import BaseStore from '../utils/BaseStore';
import {ActionTypes, LoadingStates} from '../constants/IndicatorConstants';

let storeData = Immutable.fromJS({
  state: LoadingStates.DONE
});

class _IndicatorStore extends BaseStore {
  getAll() {
    return storeData;
  }
}

const IndicatorStore = new _IndicatorStore();

IndicatorStore.dispatchToken = Dispatcher.register((action) => {
  switch(action.type) {
    case ActionTypes.UPDATE_LOAD_STATE:
      storeData = storeData.set('state', action.state);
      IndicatorStore.emitChange();
      break;
    default:
      // do nothing
  }
});

export default IndicatorStore;
