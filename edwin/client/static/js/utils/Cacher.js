import Immutable from 'immutable';
import localForage from 'localforage';
import _ from 'lodash';
import Dispatcher from '../dispatcher.js';

const CACHE_VERSION = 1;

let Cacher = {
  recallAction(actionType) {
    let key = actionType.toString();
    return localForage.getItem(key)
    .then(action => {
      if (!action) {
        // cache miss
        return;
      }
      if ((action.cache === undefined) ||
          ((action.cache.version || 0) < CACHE_VERSION)) {
        // cache stale
        localForage.clear(key);
        return;
      }
      // cache hit
      Dispatcher.dispatch(action);
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
    value.cache = {
      fromCache: true,
      version: CACHE_VERSION,
    };
    localForage.setItem(key, value);
  }

  if ('invalidate' in action.cache) {
    let key = action.cache.invalidate.toString();
    localForage.clear(key);
  }
});

export default Cacher;
