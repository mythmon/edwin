import React from 'react';
import Gravatar from 'react-gravatar';
import Immutable from 'immutable';
import cx from 'classnames';

import ControllerComponent from '../utils/ControllerComponent';
import Data from './Data';
import BugStore from '../stores/BugStore';
import PRStore from '../stores/PRStore';
import TeamStore from '../stores/TeamStore';
import UserActions from '../actions/UserActions.js';
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
    let teamSlug = this.props.params.team;
    let bugQuery = {comment_tag: `edwin-${teamSlug}`};

    return UserActions.restore()
    .then(() => TimelineActions.loadTeams())
    .then(() => {
      let team = TeamStore.get(teamSlug);
      let promise = TimelineActions.loadBugs(bugQuery);
      if (team && team.get('github_repo')) {
        promise = promise.then(() => TimelineActions.loadPRs(team.get('github_repo')));
      }
      return promise;
    });
  }

  getNewState() {
    return {
      timelineBugs: BugStore.getTimelineBugs(),
      unsortedBugs: BugStore.getUnsortedBugs(),
      notReadyBugs: BugStore.getNotReadyBugs(),
      user: UserStore.getAll(),
    };
  }

  handleCommitSort() {
    TimelineActions.commitSortOrder();
  }

  render() {
    let teamTag = `edwin-${this.props.params.team}`;

    return (
      <div className="Timeline">
        <div className="Timeline__Actions">
          {this.state.user.get('loggedIn')
            ? <button onClick={this.handleCommitSort.bind(this)}>Commit sort</button>
            : null}
          <button onClick={this.loadData.bind(this)}>Refresh</button>
        </div>
        <BugTable title="Timeline" bugs={this.state.timelineBugs} user={this.state.user}/>
        <BugTable title="Unsorted" bugs={this.state.unsortedBugs} user={this.state.user}/>
        <BugTable title="Not Ready" bugs={this.state.notReadyBugs} user={this.state.user}/>

        <div className="Footer">
          Help: To add bugs to the queue, add a tag to the bug description with <code>{teamTag}</code>.
        </div>
      </div>
    );
  }
}
Timeline.propTypes = {
  params: React.PropTypes.object.isRequired,
};

class BugTable extends React.Component {
  render() {
    if (this.props.bugs.size === 0) {
      return (
        <section>
          <h1>{this.props.title}</h1>
          No bugs. Add some bugs!
        </section>
      );
    }

    let includeActions = this.props.user.get('loggedIn');

    return (
      <section>
        <h1>{this.props.title}</h1>
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
                PRs
              </th>
              <th className="BugTable__head">
                State
              </th>
              {includeActions ? <th className="BugTable__head">Actions</th> : null}
            </tr>
          </thead>

          <tbody>
            {this.props.bugs.map(bug => {
              return (
                <BugRow
                  key={`bug-${bug.get('id')}`}
                  bug={bug}
                  includeActions={includeActions}/>
              );
            })}
          </tbody>
        </table>
      </section>
    );
  }
}
BugTable.propTypes = {
  bugs: React.PropTypes.object.isRequired,
  title: React.PropTypes.string.isRequired,
  user: React.PropTypes.object.isRequired,
};


/**
 * Renders a single <tr> in a bug table.
 */
class BugRow extends React.Component {
  handleSortOrder({target: {value}}) {
    value = parseInt(value);
    if (isNaN(value)) {
      value = null;
    }
    TimelineActions.setInternalSort(this.props.bug.get('id'), value);
  }

  handleYoink() {
    TimelineActions.grabBug(this.props.bug.get('id'));
  }

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
    actions.push(
      <input
        key="sortOrder"
        className="sort-order"
        onChange={this.handleSortOrder.bind(this)}
        value={bug.get('sortOrder')}/>
    );
    if (bug.get('state') === BugStates.READY) {
      actions.push(
        <button key="yoink" onClick={this.handleYoink.bind(this)}>
          Yoink!
        </button>
      );
    }

    return (
      <tr>
        <td className="BugTable__data--right">
          <a href={bugUrl}>{bug.get('id')}</a>
        </td>
        <td className="BugTable__data">
          {bug.get('summary')}
          <WhiteboardGroup data={bug.get('whiteboardParsed').filter((_, key) => key !== 'p')}/>
          <NeedinfoGroup data={bug.get('needinfo', [])}/>
        </td>
        <td className="BugTable__data--center">
          <AssignedTo user={bug.get('assigned_to_detail')}/>
        </td>
        <td className="BugTable__data--center">
          {bug.getIn(['whiteboardParsed', 'p'])}
        </td>
        <td className="BugTable__data--center">
          <ul className="BugTable__LinkList">
            {bug.get('prs').map(pr => <li key={`pr-${pr.get('id')}`}><PullRequestLink pr={pr}/></li>)}
          </ul>
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
AssignedTo.propTypes = {
  user: React.PropTypes.object.isRequired,
};


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
StateProgress.propTypes = {
  allStates: React.PropTypes.object.isRequired,
  currentState: React.PropTypes.string.isRequired,
  toDisplay: React.PropTypes.func.isRequired,
};

class WhiteboardGroup extends React.Component {
  render() {
    return (
      <span className="WhiteboardGroup">
        {this.props.data
          .map((value, name) => (
            <span className="WhiteboardGroup__Data" key={name}>
              {value === true
                ? `[${name}] `
                : `${name}=${value} `}
            </span>
          ))
          .toList().toJS()}
      </span>
    );
  }
}
WhiteboardGroup.propTypes = {
  data: React.PropTypes.object.isRequired,
};

class NeedinfoGroup extends React.Component {
  render() {
    return (
      <span className="NeedinfoGroup">
        {this.props.data
          .map(flag => (
            <span className="NeedinfoGroup__Data">
              ni? {flag.name}
            </span>
          ))
         .toJS()}
      </span>
    );
  }
}
NeedinfoGroup.propTypes = {
  data: React.PropTypes.object.isRequired,
};

class PullRequestLink extends React.Component {
  render() {
    const className = cx('PullRequestLink', {
      'PullRequestLink--closed': this.props.pr.get('state') === 'closed',
      'PullRequestLink--merged': this.props.pr.get('merged_at') !== null,
    });
    return (
      <a href={this.props.pr.get('html_url')}>
        <span className={className}>
          #{this.props.pr.get('number')}
        </span>
      </a>
    );
  }
}
PullRequestLink.propTypes = {
  pr: React.PropTypes.object.isRequired,
};
