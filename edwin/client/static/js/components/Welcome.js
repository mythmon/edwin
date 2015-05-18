import React from 'react';

/**
 * Wrapper for the rest of the app.
 * @class
 */
export default class Welcome extends React.Component {
  render() {
    return (
      <div className="Welcome">
        <h1>Oh hai!</h1>
          <p>
            This is Edwin. It is super pre-alpha. Click on <b>Teams</b> above, then choose a team.
          </p>
          <p>
            If you have any problems, add an issue to the <a href="https://github.com/mythmon/edwin/issues">issue tracker</a>.
          </p>
        </div>
    );
  }
}
