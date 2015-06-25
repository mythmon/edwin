import Immutable from 'immutable';
import localForage from 'localforage';
import _ from 'lodash';
import Dispatcher from '../dispatcher.js';

let Cacher = {
  recallAction(actionType) {
    let key = actionType.toString();
    return localForage.getItem(key)
    .then(action => {
      if (action) {
        Dispatcher.dispatch(action);
      }
    });
  }
};

Cacher.dispatchToken = Dispatcher.register(action => {
  if (!(action.cache)) {
    return;
  }

  if (action.cache.store) {
    let key = action.type.toString();
    let value = _.clone(action);
    delete value.cache;
    localForage.setItem(key, value);
  }

  if ('invalidate' in action.cache) {
    let key = action.cache.invalidate.toString();
    localForage.clear(key);
  }
});

export default Cacher;
