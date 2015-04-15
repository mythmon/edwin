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
import * as BzAPI from './utils/BzAPI';

TimelineDispatcher.register((action) => {
  console.log('Dispatched action:', action);
});

React.render(<TimelineApp/>, document.body);

TimelineActions.updateSearch({whiteboard: 's=2015.6'});
