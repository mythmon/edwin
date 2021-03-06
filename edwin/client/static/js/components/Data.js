import React from 'react';

/* eslint-disable react/no-danger */
export default class Data extends React.Component {
  render() {
    return (
      <script type="application/json"
              name={this.props.name}
              className="data"
              dangerouslySetInnerHTML={{__html: JSON.stringify(this.props.data)}}/>
    );
  }
}
/* eslint-enable react/no-danger */

Data.propTypes = {
  name: React.PropTypes.string.isRequired,
  data: React.PropTypes.any.isRequired,
};
