import React from 'react';
import Immutable from 'immutable';

/**
 * Base for components that need to use stores, and want autobinding.
 * @class
 */
export default class ControllerComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.getNewState();

    for (let name of this.autoBind) {
      this[name] = this[name].bind(this);
    }
  }

  /**
   * @returns {List.<Store>} A list of stores to subscribe to.
   */
  get stores() {
    return [];
  }

  /**
   * @returns {Array.<String>} A list of names of methods to auto-bind to this class.
   */
  get autoBind() {
    return ['onChange'];
  }

  /**
   * Get the state of the component by querying the stores.
   *
   * NB: Don't make these Immutable.Map instances, because React doesn't like
   * that. Which is sad. TODO: Can we fix that?
   *
   * @returns {Object} The new state.
   */
  getNewState() {
    return {};
  }

  /**
   * When a store changes, call {@link getNewState()}.
   */
  onChange() {
    this.setState(this.getNewState());
  }

  /**
   * On mounting, subscribe to all stores.
   */
  componentDidMount() {
    for (let store of this.stores) {
      store.addChangeListener(this.onChange);
    }
  }

  /**
   * On unmounting, unsubscribe.
   */
  componentWillUnmount() {
    for (let store of this.stores) {
      store.removeChangeListener(this.onChange);
    }
  }
}
