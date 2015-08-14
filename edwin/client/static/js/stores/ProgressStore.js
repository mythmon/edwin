/**
 * Progress store holds the current data loading state.
 */

import Immutable from 'immutable';

import Dispatcher from '../dispatcher';
import BaseStore from '../utils/BaseStore';
import {ActionTypes, LoadingStates} from '../constants/ProgressConstants';

let storeData = Immutable.fromJS({
});

class _ProgressStore extends BaseStore {
  getAll() {
    return storeData;
  }

  getRunning() {
    return storeData.keys();
  }
}

const ProgressStore = new _ProgressStore();

ProgressStore.dispatchToken = Dispatcher.register((action) => {
  let taskName = action.name;

  switch(action.type) {
    // Note: START_TASK and END_TASK are not atomic operations so they
    // allow for race conditions. Theoretically a single process
    // should be starting and ending its own task and its task should
    // have a unique name. Thereby we won't encounter two processes
    // fiddling with the same task.
    case ActionTypes.START_TASK:
      storeData = storeData.set(taskName, true);
      ProgressStore.emitChange();
      break;
    case ActionTypes.END_TASK:
      if (storeData.has(taskName)) {
        storeData = storeData.delete(taskName);
        ProgressStore.emitChange();
      }
      break;
    default:
      // do nothing
  }
});

export default ProgressStore;
