// Imports
const express = require('express');
const fs = require('fs');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { MongoClient } = require('mongodb');
require('dotenv').config();

// Variables
let aboutMessage = 'Issue Tracker API v1.0';
let db;
const url = process.env.DB_URL || 'mongodb://localhost/issueTracker';
const port = process.env.API_SERVER_PORT || 3000;
const enableCORS = (process.env.ENABLE_CORS || 'true') === 'true'; // env var is a String, not a boolean

// Database
async function connectToDb() {
  const client = new MongoClient(url, { useNewUrlParser: true });
  await client.connect();

  console.log('Connected to DB');

  db = client.db();
}

async function getNextSequence(name) {
  const result = await db.collection('counters').findOneAndUpdate(
    { _id: name },
    { $inc: { current: 1 } },
    { returnOriginal: false },
  );

  return result.value.current;
}

// Validation
function validateIssue(issue) {
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

// Query resolvers
async function issueList() {
  const issues = await db.collection('issues').find({}).toArray();
  return issues;
}

// Mutation resolvers
function setAboutMessage(_, { message }) {
  aboutMessage = message;
  return aboutMessage;
}

async function issueAdd(_, { issue }) {
  const newIssue = Object.assign({}, issue);
  validateIssue(newIssue);

  newIssue.created = new Date();
  newIssue.id = await getNextSequence('issues');
  if (newIssue.status === undefined) { newIssue.status = 'New'; }

  const result = await db.collection('issues').insertOne(newIssue);
  const savedIssue = await db.collection('issues').findOne({ _id: result.insertedId });

  return savedIssue;
}

// Custom type resolvers
const GraphQLDate = new GraphQLScalarType({
  name: 'GraphQLDate',
  description: '',
  serialize(value) {
    return value.toISOString();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      const value = new Date(ast.value);
      return Number.isNaN(value.getTime()) ? undefined : value;
    }
    return undefined;
  },
  parseValue(value) {
    const dateValue = new Date(value);
    return Number.isNaN(dateValue.getTime()) ? undefined : dateValue;
  },
});

// GraphQL resolvers
const resolvers = {
  Query: {
    about: () => aboutMessage,
    issueList,
  },
  Mutation: {
    setAboutMessage, // Object property shorthand, same as { setAboutMessage: setAboutMessage }
    issueAdd,
  },
  GraphQLDate,
};

// ApolloServer config
const server = new ApolloServer({
  typeDefs: fs.readFileSync('./schema.graphql', 'utf-8'),
  resolvers,
  formatErrors: (formatError) => {
    console.log(formatError);
    return formatError;
  },
});

// Express config
const app = express();

server.applyMiddleware({ app, path: '/graphql', cors: enableCORS });
console.log('CORS setting', enableCORS);

(async function start() {
  try {
    await connectToDb();
    app.listen(port, () => {
      console.log(`API server listening on port ${port}`);
    });
  } catch (err) {
    console.log(err);
  }
}());
