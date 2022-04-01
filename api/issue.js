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

async function update(_, { id, changes }) {
  const db = getDb();
  if (changes.title || changes.owner || changes.status) {
    const issue = await db.collection('issues').findOne({ id });
    Object.assign(issue, changes);
    validate(issue);
  }
  await db.collection('issues').updateOne({ id }, { $set: changes });
  const savedIssue = await db.collection('issues').findOne({ id });
  return savedIssue;
}

// Query resolvers
async function list(_, { status, effortMin, effortMax }) {
  const db = getDb();
  const filter = {};

  if (status) {
    filter.status = status;
  }

  if (effortMin !== undefined || effortMax !== undefined) {
    filter.effort = {};
    if (effortMin !== undefined) { filter.effort.$gte = effortMin; }
    if (effortMax !== undefined) { filter.effort.$lte = effortMax; }
  }

  const issues = await db.collection('issues').find(filter).toArray();
  return issues;
}

async function get(_, { id }) {
  const db = getDb();
  const issue = await db.collection('issues').findOne({ id });
  return issue;
}

module.exports = {
  add, update, list, get,
};
