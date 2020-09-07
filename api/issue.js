const { UserInputError } = require('apollo-server-express');
const { getDb, getNextSequence } = require('./db');

// Validation
function validate(issue) {
  const errors = [];

  if (issue.title.length < 3) {
    errors.push('Field "Title" must be at least 3 characters long.');
  }

  if (issue.status === 'Assigned' && !issue.owner) {
    errors.push('Field "Owner" is required when status is "Assigned".');
  }

  if (errors.length > 0) {
    throw new UserInputError('Invalid input(s).', { errors });
  }
}

// Mutation resolvers
async function add(_, { issue }) {
  const db = getDb();
  const newIssue = Object.assign({}, issue);
  validate(newIssue);

  newIssue.created = new Date();
  newIssue.id = await getNextSequence('issues');
  if (newIssue.status === undefined) { newIssue.status = 'New'; }

  const result = await db.collection('issues').insertOne(newIssue);
  const savedIssue = await db.collection('issues').findOne({ _id: result.insertedId });

  return savedIssue;
}

// Query resolvers
async function list(_, { status }) {
  const db = getDb();
  const filter = {};
  if (status) {
    filter.status = status;
  }
  const issues = await db.collection('issues').find(filter).toArray();
  return issues;
}

module.exports = { add, list };
