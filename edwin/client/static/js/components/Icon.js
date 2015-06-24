import React from 'react';

export default class Icon extends React.Component {
  render() {
    return <span onClick={this.props.onClick} className={`fa fa-${this.props.name}`}/>;
  }
}

Icon.propTypes = {
  name: React.PropTypes.string.isRequired,
  onClick: React.PropTypes.func,
};
