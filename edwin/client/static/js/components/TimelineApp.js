import React from 'react';
import Gravatar from 'react-gravatar';
import Immutable from 'immutable';

import BaseComponent from '../utils/BaseComponent';
import BugStore from '../stores/BugStore';
import {BugStates} from '../constants/TimelineConstants';

/**
 * Renders most of the bug UI. Should contain the Queue, Ready, and Not Ready
 * sections.
 * @class
 */
export default class TimelineApp extends BaseComponent {
  get stores() {
    return [BugStore];
  }

  getNewState() {
    return {
      bugs: BugStore.getAll(),
    };
  }

  render() {
    let bugs = this.state.bugs.sortBy((bug) => bug.get('state').value);
    return <BugTable bugs={bugs}/>;
  }
}

class BugTable extends React.Component {
  render() {
    return (
      <div>
        <table className="BugTable">
          <thead>
            <tr>
              <th className="BugTable__head">
                ID
              </th>
              <th className="BugTable__head">
                Summary
              </th>
              <th className="BugTable__head">
                Assigned to
              </th>
              <th className="BugTable__head">
                Points
              </th>
              <th className="BugTable__head">
                PR
              </th>
              <th className="BugTable__head">
                State
              </th>
            </tr>
          </thead>

          <tbody>
            {this.props.bugs.map((bug) => {
              let bugId = bug.get('id');
              return <BugRow
                key={`bug-${bugId}`}
                bug={bug}/>;
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
    let bugUrl = `https://bugzilla.mozilla.org/show_bug.cgi?id=${bug.get('id')}`;
    let bugStateList = new Immutable.List(Immutable.fromJS(BugStates).values())
      .filter((state) => state !== BugStates.UNKNOWN);

    function prettyBugState(bugState) {
      switch (bugState) {
        case BugStates.NOT_READY:
          return 'Not Ready';
        case BugStates.READY:
          return 'Ready';
        case BugStates.STARTED:
          return 'Started';
        case BugStates.IN_REVIEW:
          return 'In Review';
        case BugStates.MERGED:
          return 'Merged';
        case BugStates.DONE:
          return 'Done';
        default:
          return 'Unknown';
      }
    }

    return (
      <tr>
        <td className="BugTable__data--right">
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
        <td className="BugTable__data--center">
          {bug.getIn(['whiteboardParsed', 'p'])}
        </td>
        <td className="BugTable__data--center">
          {bug.get('prs').map((pr) => <a key={`pr-${pr.get('id')}`} href={pr.get('html_url')}>#{pr.get('number')}</a>)}
        </td>
        <td className="BugTable__data--center">
          <StateProgress allStates={bugStateList} currentState={this.props.bugState} toDisplay={prettyBugState}/>
        </td>
      </tr>
    );
  }
}


/**
 * Renders a small chip for a user. Shows a name and a Gravatar.
 *
 * TODO: This is probably useful enough to move somewhere public
 *
 * @component
 * @prop {Immutable.Map} user The user to render. Should have an email field
 *       and either a real_name or name field.
 */
class AssignedTo extends React.Component {
  render() {
    const user = this.props.user;
    if (user.get('email') === 'nobody@mozilla.org') {
      return (
        <span className="AssignedTo">
          <span className="AssignedTo__avatar--empty"/>
          <span className="AssignedTo__name">—</span>
        </span>
      );
    } else {
      return <span className="AssignedTo">
        <Gravatar className="AssignedTo__avatar" email={user.get('email')} https size={36}/>
        <span className="AssignedTo__name">{user.get('real_name', user.get('name'))}</span>
      </span>;
    }
  }
}


/**
 * Renders a small segmented progress bar of multiple states.
 *
 * @component
 * @prop {Immutable.List} allStates An ordered list of all the states to be represented.
 * @prop currentState The state to represent.
 */
class StateProgress extends React.Component {
  render() {
    let numCells = this.props.allStates.count() - 1;
    let cellsToFill = 0;

    if (!this.props.allStates.contains(this.props.currentState)) {
      return (
        <div className="StateProgress--unknown" title={(this.props.currentState || 'unknown').toString()}>
          ???
        </div>
      );
    }

    for (let state of this.props.allStates) {
      if (state === this.props.currentState) {
        break;
      }
      cellsToFill++;
    }

    console.log(this.props.currentState, cellsToFill, this.props.currentState.value);

    return (
      <div className="StateProgress">
        <div className="StateProgress__bar">
          {Immutable.Range(0, cellsToFill)
            .map((i) => <div key={`cell-${i}`} className="StateProgress__bar__cell--filled"/>)}
          {Immutable.Range(cellsToFill, numCells)
            .map((i) => <div key={`cell-${i}`} className="StateProgress__bar__cell--empty"/>)}
        </div>
        {this.props.toDisplay(this.props.currentState)}
        {this.props.currentState.value}
      </div>
    );
  }
}
