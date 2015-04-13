import React from 'react';
import BugStore from '../stores/BugStore';
import Gravatar from 'react-gravatar';

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
        <table className="BugTable">
          <thead>
            <tr>
              <th className="BugTable__head--number">
                ID
              </th>
              <th className="BugTable__head">
                Summary
              </th>
              <th className="BugTable__head">
                Assigned to
              </th>
              <th className="BugTable__head">
                Status
              </th>
              <th className="BugTable__head--number">
                Points
              </th>
            </tr>
          </thead>

          <tbody>
            {this.state.bugs.map((bug) => (
              <BugRow key={`bug-${bug.id}`} {...bug}/>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}


class BugRow extends React.Component {
  render() {
    return (
      <tr>
        <td className="BugTable__data--number">
          <a href={`https://bugzilla.mozilla.org/show_bug.cgi?id=${this.props.id}`}>
            {this.props.id}
          </a>
        </td>
        <td className="BugTable__data">
          {this.props.summary}
        </td>
        <td className="BugTable__data">
          <AssignedTo {...this.props.assigned_to_detail}/>
        </td>
        <td className="BugTable__data">
          {this.props.status}
        </td>
        <td className="BugTable__data--number">
          {this.props.whiteboard_parsed.p}
        </td>
      </tr>
    );
  }
}


class AssignedTo extends React.Component {
  render() {
    if (this.props.email === 'nobody@mozilla.org') {
      return <span/>;
    } else {
      return (
        <span>
          <Gravatar email={this.props.email} https size={32}/>
          {this.props.real_name || this.props.name}
        </span>
      );
    }
  }
}
