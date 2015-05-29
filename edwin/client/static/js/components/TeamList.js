import React from 'react';
import Router from 'react-router';

import ControllerComponent from '../utils/ControllerComponent';
import Data from './Data';
import * as edwinAPI from '../utils/edwinAPI';
import TeamStore from '../stores/TeamStore';

const {Link} = Router;

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

  /**
   * On mounting, fetch data from APIs.
   */
  componentDidMount() {
    super.componentDidMount();
    edwinAPI.getTeams();
  }

  render() {
    return (
      <div className="Welcome">
        <h1>Teams</h1>
        <ul>
          {this.state.teams.map((team) => {
            let key = `team-${team.get('slug')}`;
            return <li key={key}>
              <Link to="timeline" params={{team: team.get('slug')}}>
                {team.get('name')}
              </Link>
              <Data name={key} data={team}/>
            </li>;
          })}
        </ul>
      </div>
    );
  }
}
