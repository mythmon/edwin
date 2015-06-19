/**
 * Bootstrap for the app.
 *
 * Kicks off initial data load, and rendered everything, and then re-renders.
 *
 * TODO: Only render after data has loaded.
 * TODO: Add loading indicator.
 */

import React from 'react';
import * as Router from 'react-router';
const {Route, DefaultRoute} = Router;

import TimelineDispatcher from './dispatcher/TimelineDispatcher';
import * as TimelineActions from './actions/TimelineActions';

import App from './components/App';
import Welcome from './components/Welcome';
import TeamList from './components/TeamList';
import Timeline from './components/Timeline';

let routes = (
  <Route handler={App}>
    <DefaultRoute name="home" handler={Welcome}/>
    <Route name="team-list" path="t" handler={TeamList}/>
    <Route name="timeline" path="t/:team" handler={Timeline}/>
  </Route>
);

Router.run(routes, Router.HistoryLocation, (Root) => {
  React.render(<Root/>, document.body);
});
