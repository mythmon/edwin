import Immutable from 'immutable';

import Dispatcher from '../dispatcher';
import IndicatorConstants from '../constants/IndicatorConstants.js';
import IndicatorStore from '../stores/IndicatorStore.js';

export function updateState(newState) {
  Dispatcher.dispatch({
    type: IndicatorConstants.ActionTypes.UPDATE_LOAD_STATE,
    state: newState
  });
}

export default {
    updateState,
};
