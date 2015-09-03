/**
 * Bootstrap for the app.
 *
 * Kicks off initial data load, and rendered everything, and then re-renders.
 */

import React from 'react';
import * as Router from 'react-router';
const {Route, DefaultRoute} = Router;

import Dispatcher from './dispatcher';
import {TimelineActions} from './actions/';
import {App, Welcome, TeamList, Timeline} from './components/';

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
