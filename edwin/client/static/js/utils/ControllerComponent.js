import React from 'react';
import Immutable from 'immutable';

/**
 * Base for components that need to use stores, and want autobinding.
 * @class
 */
export default class ControllerComponent extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    for (let name of this.autoBind) {
      this[name] = this[name].bind(this);
    }
    this.onChange = this.onChange.bind(this);
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
   * Dispatch async events to load data required for this component.
   * @promise {undefined} Signals completion. Data is ignored.
   */
  loadData() {
    return Promise.resolve();
  }

  /**
   * When a store changes, call {@link getNewState()}.
   */
  onChange() {
    this.setState(this.getNewState());
  }

  /**
   * Call {@link fetchData} when the component is being mounted.
   */
  componentWillMount() {
    this.setState(this.getNewState());
    this.loadData()
    .catch(err => {
      console.error('Error loading data:', err);
      throw err;
    });
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
