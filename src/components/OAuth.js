import React from 'react';
import PropTypes from 'prop-types';

class OAuth extends React.Component {
    render() {
        return (
            <body onload={this.props.oauth_user()}>
                <h4>Logging in to Jira</h4>
            </body>
        );
    }
}

export default OAuth;

OAuth.propTypes = {
    oauth_user: PropTypes.func.isRequired
};