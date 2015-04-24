import React from 'react';
import Gravatar from 'react-gravatar';

import BaseComponent from '../utils/BaseComponent';
import BugStore from '../stores/BugStore';
import BugToPRStore from '../stores/BugToPRStore';

/**
 * Renders most of the bug UI. Should contain the Queue, Ready, and Not Ready
 * sections.
 * @class
 */
export default class TimelineApp extends BaseComponent {
  get stores() {
    return [BugStore, BugToPRStore];
  }

  getNewState() {
    return {
      bugs: BugStore.getAll(),
      bugToPRs: BugToPRStore.getAll(),
    };
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
              <th className="BugTable__head--number">
                PR
              </th>
            </tr>
          </thead>

          <tbody>
            {this.state.bugs.map((bug) => {
              return <BugRow
                key={`bug-${bug.get('id')}`}
                bug={bug}
                prs={BugToPRStore.get(bug.get('id'))}/>;
            })}
          </tbody>
        </table>
      </div>
    );
  }
}


/**
 * Renders a single <tr> in a bug table.
 */
class BugRow extends React.Component {
  render() {
    let bug = this.props.bug;
    let prs = this.props.prs;
    let bugUrl = `https://bugzilla.mozilla.org/show_bug.cgi?id=${bug.get('id')}`;

    return (
      <tr>
        <td className="BugTable__data--number">
          <a href={bugUrl}>
            {bug.get('id')}
          </a>
        </td>
        <td className="BugTable__data">
          {bug.get('summary')}
        </td>
        <td className="BugTable__data">
          <AssignedTo user={bug.get('assigned_to_detail')}/>
        </td>
        <td className="BugTable__data">
          {bug.get('status')}
        </td>
        <td className="BugTable__data--number">
          {bug.getIn(['whiteboard_parsed', 'p'])}
        </td>
        <td className="BugTable__data--number">
          {prs.map((pr) => <a href={pr.get('html_url')}>#{pr.get('number')}</a>)}
        </td>
      </tr>
    );
  }
}


/**
 * Renders a small chip for a user. Shows a name and a Gravatar.
 *
 * TODO: This is probably useful enough to move somewhere public
 */
class AssignedTo extends React.Component {
  render() {
    const user = this.props.user;
    if (user.get('email') === 'nobody@mozilla.org') {
      return <span/>;
    } else {
      return <span>
        <Gravatar email={user.get('email')} https size={32}/>
        {user.get('real_name', user.get('name'))}
      </span>;
    }
  }
}
