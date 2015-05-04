/**
 * Bootstrap for the app.
 *
 * Kicks off initial data load, and rendered everything, and then re-renders.
 *
 * TODO: Only render after data has loaded.
 * TODO: Add loading indicator.
 */

import React from 'react';
import TimelineApp from './components/TimelineApp';
import TimelineDispatcher from './dispatcher/TimelineDispatcher';
import * as TimelineActions from './actions/TimelineActions';
import './utils/bzAPI';
import './utils/githubAPI';

TimelineDispatcher.register((action) => {
  console.log('Dispatched action:', action);
});

TimelineActions.updateSearch({'comment_tag': 'edwin-sumo'});
React.render(<TimelineApp/>, document.body);
