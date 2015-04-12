import React from 'react';
import BugStore from '../stores/BugStore';

function getStateFromStores() {
  return {
    bugs: BugStore.getAll(),
  };
}

export default class TimelineApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = getStateFromStores();

    this.onChange = this.onChange.bind(this);
  }

  componentDidMount() {
    BugStore.addChangeListener(this.onChange);
  }

  componentWillUnmount() {
    BugStore.removeChangeListener(this.onChange);
  }

  onChange() {
    this.setState(getStateFromStores());
  }

  render() {
    return (
      <div>
        <ul>
          {this.state.bugs.map((bug) => (
            <li key={`bug-${bug.id}`}>
              <a href="#">{bug.id}</a>
              {bug.summary}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}
