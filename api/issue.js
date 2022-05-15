// Imports
const { UserInputError } = require('apollo-server-express');
const { getDb, getNextSequence } = require('./db');

// Constants
const PAGE_SIZE = 10;

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

async function remove(_, { id }) {
  const db = getDb();
  const issue = await db.collection('issues').findOne({ id });
  if (!issue) { return false; }
  issue.deleted = new Date();

  let result = await db.collection('deleted_issues').insertOne(issue);
  if (result.insertedId) {
    result = await db.collection('issues').removeOne({ id });
    return result.deletedCount === 1;
  }
  return false;
}

// Query resolvers
async function list(_, {
  status, effortMin, effortMax, page,
}) {
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

  const cursor = db.collection('issues').find(filter)
    .sort({ id: 1 })
    .skip(PAGE_SIZE * (page - 1))
    .limit(PAGE_SIZE);
  
  const totalCount = await cursor.count(false);
  const issues = cursor.toArray();
  const pages = Math.ceil(totalCount / PAGE_SIZE);

  return { issues, pages };
}

async function get(_, { id }) {
  const db = getDb();
  const issue = await db.collection('issues').findOne({ id });
  return issue;
}

async function counts(_, { status, effortMin, effortMax }) {
  const db = getDb();
  const filter = {};

  if (status) { filter.status = status; }

  if (effortMin !== undefined || effortMax !== undefined) {
    filter.effort = {};
    if (effortMin !== undefined) { filter.effort.$gte = effortMin; }
    if (effortMax !== undefined) { filter.effort.$lte = effortMax; }
  }

  const results = await db.collection('issues').aggregate([
    { $match: filter },
    {
      $group: {
        _id: { owner: '$owner', status: '$status' },
        count: { $sum: 1 },
      },
    },
  ]).toArray();

  const stats = {};
  results.forEach((result) => {
    // eslint-disable-next-line no-underscore-dangle
    const { owner, status: statusKey } = result._id;
    if (!stats[owner]) { stats[owner] = { owner }; }
    stats[owner][statusKey] = result.count;
  });

  return Object.values(stats);
}

module.exports = {
  add,
  update,
  delete: remove,
  list,
  get,
  counts,
};
