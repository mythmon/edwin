import {EventEmitter} from 'events';

const CHANGE_EVENT = 'change';

/**
 * Base class for Stores.
 */
class BaseStore extends EventEmitter {
  /**
   * Note that something has changed on this Store, and update all listeners.
   */
  emitChange() {
    this.emit(CHANGE_EVENT);
  }

  /**
   * Add a change listener.
   *
   * @param {function} callback Function to call on change. No arguments are
   *   passed.
   */
  addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  }

  /**
   * Remove a listener.
   *
   * @param {function} callback The function that was originall passed to
   *   {@link addChangeListener}.
   */
  removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }
}

export default BaseStore;
