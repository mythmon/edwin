import React from 'react';
import Router from 'react-router';

const {Link} = Router;

import {Data} from './';
import {ControllerComponent, edwinAPI} from '../utils/';
import {TeamStore} from '../stores/';
import {TimelineActions} from '../actions/';

/**
 * Shows a list of teams.
 * @class
 */
export default class TeamList extends ControllerComponent {
  get stores() {
    return [TeamStore];
  }

  getNewState() {
    return {
      teams: TeamStore.getAll(),
    };
  }

  loadData() {
    TimelineActions.setCurrentTeam(null);
    return TimelineActions.loadTeams();
  }

  render() {
    document.title = 'Teams (Edwin)';

    return (
      <div className="Welcome">
        <h1>Teams</h1>
        <ul>
          {this.state.teams.map((team) => {
            let key = `team-${team.get('slug')}`;
            return (
              <li key={key}>
                <Link to="timeline" params={{team: team.get('slug')}}>
                  {team.get('name')}
                </Link>
                <Data name={key} data={team}/>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
