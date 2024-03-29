import React from 'react';
import { withRouter } from 'react-router-dom';
import {
  Button,
  Glyphicon,
  Tooltip,
  OverlayTrigger,
  Table,
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import UserContext from './UserContext.js';

// eslint-disable-next-line react/prefer-stateless-function
class IssueRowPlain extends React.Component {
  render() {
    const {
      issue, location: { search }, closeIssue, deleteIssue, index,
    } = this.props;
    const user = this.context;
    const disabled = !user.signedIn;

    const selectLocation = { pathname: `/issues/${issue.id}`, search };
    const editTooltip = (
      <Tooltip id={`edit-tooltip-${issue.id}`} placement="top">{`Edit issue ${issue.id}`}</Tooltip>
    );
    const closeTooltip = (
      <Tooltip id={`close-tooltip-${issue.id}`} placement="top">{`Close issue ${issue.id}`}</Tooltip>
    );
    const deleteTooltip = (
      <Tooltip id={`delete-tooltip-${issue.id}`} placement="top">{`Delete issue ${issue.id}`}</Tooltip>
    );

    function onClose(e) {
      e.preventDefault();
      closeIssue(index);
    }

    function onDelete(e) {
      e.preventDefault();
      deleteIssue(index);
    }

    const tableRow = (
      <tr>
        <td>{issue.id}</td>
        <td>{issue.status}</td>
        <td>{issue.owner}</td>
        <td>{issue.created.toDateString()}</td>
        <td>{issue.effort}</td>
        <td>{issue.due ? issue.due.toDateString() : ''}</td>
        <td>{issue.title}</td>
        <td>
          <LinkContainer to={`/edit/${issue.id}`}>
            <OverlayTrigger delay={1000} overlay={editTooltip}>
              <Button bsSize="xsmall" type="button">
                <Glyphicon glyph="edit" />
              </Button>
            </OverlayTrigger>
          </LinkContainer>
          {' | '}
          <OverlayTrigger delay={1000} overlay={closeTooltip}>
            <Button disabled={disabled} bsSize="xsmall" type="button" onClick={onClose}>
              <Glyphicon glyph="remove" />
            </Button>
          </OverlayTrigger>
          {' | '}
          <OverlayTrigger delay={1000} overlay={deleteTooltip}>
            <Button disabled={disabled} bsSize="xsmall" type="button" onClick={onDelete}>
              <Glyphicon glyph="trash" />
            </Button>
          </OverlayTrigger>
        </td>
      </tr>
    );

    return (
      <LinkContainer to={selectLocation}>
        {tableRow}
      </LinkContainer>
    );
  }
}

IssueRowPlain.contextType = UserContext;
const IssueRow = withRouter(IssueRowPlain);
delete IssueRow.contextType;

export default function IssueTable({ issues, closeIssue, deleteIssue }) {
  const issueRows = issues.map((issue, index) => (
    <IssueRow
      key={issue.id}
      issue={issue}
      closeIssue={closeIssue}
      deleteIssue={deleteIssue}
      index={index}
    />
  ));

  return (
    <Table bordered condensed hover responsive>
      <thead>
        <tr>
          <th>ID</th>
          <th>Status</th>
          <th>Owner</th>
          <th>Created</th>
          <th>Effort</th>
          <th>Due Date</th>
          <th>Title</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {issueRows}
      </tbody>
    </Table>
  );
}
