import React from 'react';
import * as Router from 'react-router';

let {Link, RouteHandler} = Router;

/**
 * Wrapper for the rest of the app.
 * @class
 * @prop {Component} The UI to render. Provided by the router.
 */
export default class App extends React.Component {
  render() {
    return (
      <div className="App">
        <Navigation/>
        <RouteHandler/>
      </div>
    );
  }
}

class Navigation {
  render() {
    return (
      <div className="Header">
        <header>
          <nav>
            <Link to="home">Edwin</Link>
            <Link to="team-list">Teams</Link>
          </nav>
        </header>
      </div>
    );
  }
}
