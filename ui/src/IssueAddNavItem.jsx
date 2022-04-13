import React from 'react';
import {
  OverlayTrigger,
  Tooltip,
  NavItem,
  Glyphicon,
  Modal,
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  ButtonToolbar,
  Button,
} from 'react-bootstrap';
import { withRouter } from 'react-router-dom';

import graphQLFetch from './graphQLFetch.js';
import Toast from './Toast.jsx';

class IssueAddNavItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showing: false,
      toastVisible: false,
      toastMessage: '',
      toastType: 'success',
    };
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.showError = this.showError.bind(this);
    this.dismissToast = this.dismissToast.bind(this);
  }

  showModal() {
    this.setState({ showing: true });
  }

  hideModal() {
    this.setState({ showing: false });
  }

  async handleSubmit(e) {
    e.preventDefault();

    const tenDays = 1000 * 60 * 60 * 24 * 10;
    const form = document.forms.issueAdd;
    const issue = {
      owner: form.owner.value,
      title: form.title.value,
      due: new Date(new Date().getTime() + tenDays),
    };

    const query = `mutation issueAdd($issue: IssueInputs!) {
      issueAdd(issue: $issue) {
        id
      }
    }`;

    const data = await graphQLFetch(query, { issue }, this.showError);

    if (data) {
      const { history } = this.props;
      history.push(`/edit/${data.issueAdd.id}`);
      this.hideModal();
    }
  }

  showError(message) {
    this.setState({
      toastVisible: true, toastMessage: message, toastType: 'danger',
    });
  }

  dismissToast() {
    this.setState({ toastVisible: false });
  }

  render() {
    const {
      showing,
      toastVisible,
      toastMessage,
      toastType,
    } = this.state;

    return (
      <React.Fragment>
        <NavItem onClick={this.showModal}>
          <OverlayTrigger
            placement="left"
            delayShow={1000}
            overlay={<Tooltip id="create-issue">Create Issue</Tooltip>}
          >
            <Glyphicon glyph="plus" />
          </OverlayTrigger>
        </NavItem>
        <Modal keyboard show={showing} onHide={this.hideModal}>
          <Modal.Header closeButton>
            <Modal.Title>Create Issue</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form name="issueAdd">
              <FormGroup>
                <ControlLabel>Title:</ControlLabel>
                <FormControl name="title" autoFocus />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Owner:</ControlLabel>
                <FormControl name="owner" />
              </FormGroup>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <ButtonToolbar>
              <Button
                type="button"
                bsStyle="primary"
                onClick={this.handleSubmit}
              >
                Submit
              </Button>
              <Button
                bsStyle="link"
                onClick={this.hideModal}
              >
                Cancel
              </Button>
            </ButtonToolbar>
          </Modal.Footer>
        </Modal>
        <Toast
          showing={toastVisible}
          bsStyle={toastType}
          onDismiss={this.dismissToast}
        >
          {toastMessage}
        </Toast>
      </React.Fragment>
    );
  }
}

export default withRouter(IssueAddNavItem);
