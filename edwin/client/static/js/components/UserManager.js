import React from 'react';
import Immutable from 'immutable';

import {ControllerComponent, Cacher} from '../utils/';
import {UserStore} from '../stores/';
import {UserActions} from '../actions/';
import {Icon} from './';

export default class UserManager extends ControllerComponent {
  get stores() {
    return [UserStore];
  }

  get autoBind() {
    return ['handleExpand'];
  }

  loadData() {
    return UserActions.restore();
  }

  getNewState() {
    return {
      user: UserStore.getAll(),
      expanded: false,
    };
  }

  handleExpand() {
    this.setState((state) => ({
      expanded: !state.expanded,
    }));
  }

  render() {
    let user = this.state.user;

    if (user.get('loggedIn')) {
      return (
        <div className="UserManager logged-in">
          <span>{user.get('username')}</span>
          <Icon onClick={this.handleExpand} name="user"/>
          {this.state.expanded ? <LogoutForm/> : null}
        </div>
      );
    } else {
      return (
        <div className="UserManager">
          <Icon onClick={this.handleExpand} name="user-times"/>
          {this.state.expanded ? <LoginForm/> : null}
        </div>
      );
    }
  }
}

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      apikey: '',
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange({target: {name, value}}) {
    this.setState({[name]: value});
  }

  handleSubmit() {
    UserActions.login(this.state.username, this.state.apiKey);
  }

  render() {
    return (
      <div className="UserManager__LoginForm">
        <div>
          <label>Bugzilla Login</label>
          <input name="username" value={this.state.username} onChange={this.handleChange}/>
        </div>
        <div>
          <label>Bugzilla API Key</label>
          <input name="apiKey" value={this.state.apiKey} onChange={this.handleChange}/>
        </div>
        <div>
          <button onClick={this.handleSubmit}>Log In</button>
        </div>
        <div>
          Get an API key from <a href="https://bugzilla.mozilla.org/userprefs.cgi?tab=apikey">Bugzilla</a>
        </div>
      </div>
    );
  }
}

class LogoutForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit() {
    UserActions.logout();
  }

  render() {
    return (
      <div className="UserManager__LogoutForm">
        <div>
          <button onClick={this.handleSubmit}>Log Out</button>
        </div>
      </div>
    );
  }
}
