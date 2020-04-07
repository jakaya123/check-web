import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import IconMoreVert from '@material-ui/icons/MoreVert';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ConfirmDialog from '../layout/ConfirmDialog';
import DeleteProjectMutation from '../../relay/mutations/DeleteProjectMutation';
import ProjectAssignment from './ProjectAssignment';
import Can, { can } from '../Can';
import CheckContext from '../../CheckContext';

class ProjectActions extends Component {
  state = {
    anchorEl: null,
    openAssignPopup: false,
    showConfirmDeleteProjectDialog: false,
    projectDeletionConfirmed: false,
    message: null,
  };

  handleEdit = () => {
    const { history } = new CheckContext(this).getContextStore();
    history.push(`${window.location.pathname.match(/.*\/project\/\d+/)[0]}/edit`);
  };

  handleOpenMenu = (e) => {
    this.setState({ anchorEl: e.currentTarget });
  };

  handleCloseMenu = () => {
    this.setState({ anchorEl: null });
  };

  handleAssign = () => {
    this.setState({ openAssignPopup: true });
  };

  handleAssignClose = () => {
    this.setState({ openAssignPopup: false, anchorEl: null });
  };

  handleConfirmDestroy = () => {
    this.setState({ showConfirmDeleteProjectDialog: true, anchorEl: null });
  };

  handleCloseDialog() {
    this.setState({ showConfirmDeleteProjectDialog: false });
  }

  handleConfirmation() {
    this.setState({ projectDeletionConfirmed: !this.state.projectDeletionConfirmed });
  }

  handleDestroy() {
    const { project, team, history } = new CheckContext(this).getContextStore();

    const onSuccess = () => {
      const message = (
        <FormattedMessage
          id="projectActions.projectDeleted"
          defaultMessage="List deleted successfully."
        />
      );
      this.context.setMessage(message);
    };

    const onFailure = () => {
      const message = (
        <FormattedMessage
          id="projectActions.projectNotDeleted"
          defaultMessage="Sorry, could not delete list."
        />
      );
      this.context.setMessage(message);
    };

    Relay.Store.commitUpdate(
      new DeleteProjectMutation({
        project,
        team,
      }),
      { onSuccess, onFailure },
    );

    history.push(`/${team.slug}/all-items`);
  }

  render() {
    const {
      project,
    } = this.props;

    const menuItems = [];

    if (can(project.permissions, 'update Project')) {
      menuItems.push((
        <MenuItem
          key="projectActions.edit"
          className="project-actions__edit"
          onClick={this.handleEdit}
        >
          <ListItemText
            primary={
              <FormattedMessage id="ProjectActions.edit" defaultMessage="Edit name and description" />
            }
          />
        </MenuItem>));
    }

    if (can(project.permissions, 'update Project')) {
      menuItems.push((
        <MenuItem
          key="projectActions.assign"
          className="project-actions__assign"
          onClick={this.handleAssign}
        >
          <ListItemText
            primary={
              <FormattedMessage id="projectActions.assignOrUnassign" defaultMessage="Assign list" />
            }
          />
        </MenuItem>));
    }

    if (can(project.permissions, 'destroy Project')) {
      menuItems.push((
        <MenuItem
          key="projectActions.destroy"
          className="project-actions__destroy"
          onClick={this.handleConfirmDestroy}
        >
          <ListItemText
            primary={
              <FormattedMessage id="projectActions.destroy" defaultMessage="Delete" />
            }
          />
        </MenuItem>
      ));
    }

    return menuItems.length ?
      <Can permissions={project.permissions} permission="update Project">
        <IconButton
          className="project-actions"
          tooltip={
            <FormattedMessage id="ProjectActions.tooltip" defaultMessage="List actions" />
          }
          onClick={this.handleOpenMenu}
        >
          <IconMoreVert className="project-actions__icon" />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleCloseMenu}
        >
          {menuItems}
        </Menu>
        <ConfirmDialog
          message={this.state.message}
          open={this.state.showConfirmDeleteProjectDialog}
          title={
            <FormattedMessage
              id="projectActions.confirmDeleteProject"
              defaultMessage="Are you sure you want to delete this list? All its items will still be accessible through the 'All items' list."
            />
          }
          handleClose={this.handleCloseDialog.bind(this)}
          handleConfirm={this.handleDestroy.bind(this)}
        />
        {
          this.state.openAssignPopup ?
            <ProjectAssignment
              anchorEl={this.state.anchorEl}
              onDismiss={this.handleAssignClose}
              project={project}
            />
            : null
        }
      </Can>
      : null;
  }
}

ProjectActions.contextTypes = {
  store: PropTypes.object,
  setMessage: PropTypes.func,
};

export default injectIntl(ProjectActions);
