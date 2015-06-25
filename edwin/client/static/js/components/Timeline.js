import React from 'react';
import Gravatar from 'react-gravatar';
import Immutable from 'immutable';

import ControllerComponent from '../utils/ControllerComponent';
import Data from './Data';
import BugStore from '../stores/BugStore';
import PRStore from '../stores/PRStore';
import TeamStore from '../stores/TeamStore';
import UserStore from '../stores/UserStore.js';
import {BugStates} from '../constants/TimelineConstants';
import TimelineActions from '../actions/TimelineActions.js';
import TimelineConstants from '../constants/TimelineConstants.js';
import Cacher from '../utils/Cacher.js';
import edwinAPI from '../utils/edwinAPI.js';

/**
 * Renders most of the bug UI. Should contain the Queue, Ready, and Not Ready
 * sections.
 * @class
 */
export default class Timeline extends ControllerComponent {
  get stores() {
    return [BugStore, UserStore];
  }

  loadData() {
    return Cacher.recallAction(TimelineConstants.ActionTypes.SET_RAW_TEAMS)
    .then(() => Cacher.recallAction(TimelineConstants.ActionTypes.SET_RAW_BUGS))
    .then(() => Cacher.recallAction(TimelineConstants.ActionTypes.SET_RAW_PRS))
    .then(() => Cacher.recallAction(TimelineConstants.ActionTypes.SET_COMMENT_TAGS))
    .then(() => TimelineActions.loadTeams())
    .then(() => {
      let teamSlug = this.props.params.team;
      let team = TeamStore.get(teamSlug);

      let promise = TimelineActions.loadBugs({'comment_tag': `edwin-${teamSlug}`});

      if (team && team.get('github_repo')) {
        promise = promise.then(() => TimelineActions.loadPRs(team.get('github_repo')));
      }

      return promise;
    });
  }

  getNewState() {
    return {
      bugs: BugStore.getAll(),
      user: UserStore.getAll(),
    };
  }

  render() {
    let unsolvedBugs = this.state.bugs.filter(bug => bug.get('state') !== BugStates.DONE);
    let teamTag = `edwin-${this.props.params.team}`;

    return (
      <div className="Timeline">
        <BugTable bugs={unsolvedBugs} user={this.state.user}/>
        <div>
          Help: To add bugs to the queue, add a tag to the bug description with <code>{teamTag}</code>.
        </div>
      </div>
    );
  }
}

class BugTable extends React.Component {
  render() {
    if (this.props.bugs.size === 0) {
      return (
        <div>
          No bugs. Add some bugs!
        </div>
      );
    }

    let includeActions = this.props.user.get('loggedIn');

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
              {includeActions ? <th className="BugTable__head">Actions</th> : null}
            </tr>
          </thead>

          <tbody>
            {this.props.bugs.map((bug) => {
              return <BugRow
                key={`bug-${bug.get('id')}`}
                bug={bug}
                includeActions={includeActions}/>;
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

    // Will only be shown if this.props.includeActions
    let actions = [];
    if (bug.get('state') === BugStates.READY) {
      actions.push(
        <button key="yoink" onClick={TimelineActions.grabBug.bind(null, bug.get('id'))}>
          Yoink!
        </button>
      );
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
          {bug.get('prs').map((pr, i) => <a key={`pr-${pr.get('id')}-${i}`} href={pr.get('html_url')}>#{pr.get('number')}</a>)}
        </td>
        <td className="BugTable__data--center">
          <StateProgress allStates={bugStateList} currentState={bug.get('state')} toDisplay={prettyBugState}/>
        </td>
        {this.props.includeActions ? <td>{actions}</td> : null}
        <Data name={`bug-${bug.get('id')}`} data={bug}/>
      </tr>
    );
  }
}
BugRow.propTypes = {
  bug: React.PropTypes.object.isRequired,
  includeActions: React.PropTypes.bool.isRequired,
};


/**
 * Renders a small chip for a user. Shows a Gravatar.
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
        </span>
      );
    } else {
      return (
        <span className="AssignedTo">
          <Gravatar className="AssignedTo__avatar" email={user.get('email')} https size={36}/>
        </span>
      );
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

    return (
      <div className="StateProgress">
        <div className="StateProgress__bar">
          {Immutable.Range(0, cellsToFill)
            .map((i) => <div key={`cell-${i}`} className="StateProgress__bar__cell--filled"/>)}
          {Immutable.Range(cellsToFill, numCells)
            .map((i) => <div key={`cell-${i}`} className="StateProgress__bar__cell--empty"/>)}
        </div>
        {this.props.toDisplay(this.props.currentState)}
      </div>
    );
  }
}
