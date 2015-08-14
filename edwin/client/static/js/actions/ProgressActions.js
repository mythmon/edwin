import Immutable from 'immutable';

import Dispatcher from '../dispatcher';
import ProgressConstants from '../constants/ProgressConstants.js';
import ProgressStore from '../stores/ProgressStore.js';

export function startTask(taskName) {
  Dispatcher.dispatch({
    type: ProgressConstants.ActionTypes.START_TASK,
    name: taskName
  });
}

export function endTask(taskName) {
  Dispatcher.dispatch({
    type: ProgressConstants.ActionTypes.END_TASK,
    name: taskName
  });
}

export default {
  startTask,
  endTask,
};
