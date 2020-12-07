import React from 'react';

import graphQLFetch from './graphQLFetch.js';

export default class IssueDetail extends React.Component {
  constructor() {
    super();
    this.state = { issue: {} };
  }

  componentDidMount() {
    this.loadData();
  }

  componentDidUpdate(prevProps) {
    const { match: { params: { id: prevId } } } = prevProps;
    let { match: { params: { id } } } = this.props;

    id = parseInt(id, 10);

    if (prevId !== id) {
      this.loadData();
    }
  }

  async loadData() {
    let { match: { params: { id } } } = this.props;
    const query = `query issue($id: Int!) {
      issue (id: $id) {
        id description
      }
    }`;

    id = parseInt(id, 10);

    const data = await graphQLFetch(query, { id });

    if (data) {
      this.setState({ issue: data.issue });
    } else {
      this.setState({ issue: {} });
    }
  }

  render() {
    const { issue: { description } } = this.state;
    return (
      <div>
        <h3>Description</h3>
        <pre>{description}</pre>
      </div>
    );
  }
}
