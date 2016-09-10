import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import util from 'util';
import Header from './Header';
import FooterRelay from '../relay/FooterRelay';
import LoginMenu from './LoginMenu';
import Message from './Message';
import { request } from '../actions/actions';
import Colors from 'material-ui/lib/styles/colors';
import getMuiTheme from 'material-ui/lib/styles/getMuiTheme';
import themeDecorator from 'material-ui/lib/styles/theme-decorator';
import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';
import config from 'config';
import CheckdeskNetworkLayer from '../CheckdeskNetworkLayer';

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: Colors.blueGrey400,
    primary2Color: Colors.blueGrey600,
    primary3Color: Colors.blueGrey800,
    accent1Color: Colors.blue600,
    accent2Color: Colors.blue700,
    accent3Color: Colors.blue800
  }
});

class Home extends Component {
  setUpGraphql(token) {
    Relay.injectNetworkLayer(new CheckdeskNetworkLayer(config.relayPath, {
      get headers() {
        var headers = config.relayHeaders;
        if (token) {
          headers = {
            'X-Checkdesk-Token': token
          }
        }
        if (Checkdesk.context.team) {
          headers['X-Checkdesk-Context-Team'] = Checkdesk.context.team.dbid;
        }
        return headers;
      }
    }));
  }

  startSession(state) {
    if (state.token || state.error) {
      return;
    }

    const storedToken = window.storage.getValue('token');
    if (storedToken) {
      state.token = storedToken;
      return that.forceUpdate();
    }

    const that = this;
    var failureCallback = function(errorMessage) {
      state.message = errorMessage;
      state.error = true;
      that.forceUpdate();
    };
    var successCallback = function(userData) {
      if (userData) {
        state.token = userData.token;
      }
      else {
        state.error = true;
      }

      window.Checkdesk.currentUser = userData;
      that.setUpContext(userData);
      that.maybeRedirect(that.props.location.pathname, userData);
      that.forceUpdate();
    }
    request('get', 'me', failureCallback, successCallback);
  }

  setUpContext(userData) {
    const project = Checkdesk.context.project;
    if (project) {
      Checkdesk.context.team = project.team;
    }
  }

  maybeRedirect(location, userData) {
    if (location !== '/' || !userData) { return; }

    const userCurrentTeam = userData.current_team; // currently always null
    if (!userCurrentTeam && location !== '/teams/new') {
      return Checkdesk.history.push('/teams/new');
    }

    const project = userCurrentTeam.projects[0];
    if (project && project.dbid) {
      Checkdesk.history.push('/team/' + userCurrentTeam.dbid + '/project/' + project.dbid);
    }
    else {
      Checkdesk.history.push('/team/' + userCurrentTeam.dbid);
    }
  }

  render() {
    const { state, children } = this.props;
    this.startSession(state.app);
    this.setUpGraphql(state.app.token);

    const routeIsPublic = children && children.props.route.public;
    if (!routeIsPublic && !state.app.token) {
      if (state.app.error) {
        return (<LoginMenu {...this.props} />);
      }
      return null;
    }

    const routeIsFullscreen = children && children.props.route.fullscreen;
    if (routeIsFullscreen) {
      return (<div className='home home--fullscreen'>{children}</div>);
    }

    return (
      <div className='home'>
        <Header {...this.props} />
        <main className='home__content'>
          <div className="home__global-message global-message"><Message message={state.app.message} /></div>
          <div className='home__main'>{children}</div>
        </main>
        <FooterRelay {...this.props} />
      </div>
    );
  }
}

export default themeDecorator(muiTheme)(Home);
