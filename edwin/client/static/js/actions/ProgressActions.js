import Immutable from 'immutable';

import Dispatcher from '../dispatcher';
import ProgressActionTypes from '../constants/ProgressActionTypes.js';
import ProgressStore from '../stores/ProgressStore.js';

export function startTask(taskName) {
  Dispatcher.dispatch({
    type: ProgressActionTypes.START_TASK,
    name: taskName
  });
}

export function endTask(taskName) {
  Dispatcher.dispatch({
    type: ProgressActionTypes.END_TASK,
    name: taskName
  });
}

export default {
  startTask,
  endTask,
};
