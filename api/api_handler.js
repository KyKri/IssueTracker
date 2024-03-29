const fs = require('fs');
const { ApolloServer } = require('apollo-server-express');
const GraphQLDate = require('./graphql_date');
const about = require('./about');
const issue = require('./issue');
const auth = require('./auth');
require('dotenv').config();

function getContext({ req }) {
  const user = auth.getUser(req);
  return { user };
}

// GraphQL resolvers
const resolvers = {
  Query: {
    about: about.getMessage,
    user: auth.resolveUser,
    issueList: issue.list,
    issue: issue.get,
    issueCounts: issue.counts,
  },
  Mutation: {
    setAboutMessage: about.setMessage,
    issueAdd: issue.add,
    issueUpdate: issue.update,
    issueDelete: issue.delete,
    issueRestore: issue.restore,
  },
  GraphQLDate,
};

// ApolloServer config
const server = new ApolloServer({
  typeDefs: fs.readFileSync('./schema.graphql', 'utf-8'),
  resolvers,
  context: getContext,
  formatErrors: (formatError) => {
    console.log(formatError);
    return formatError;
  },
});

function installHandler(app) {
  const enableCORS = (process.env.ENABLE_CORS || 'true') === 'true'; // env var is a String, not a boolean
  console.log('CORS setting', enableCORS);
  let cors;
  if (enableCORS) {
    const origin = process.env.UI_SERVER_ORIGIN || 'http://localhost:8000';
    const methods = 'POST';
    cors = { origin, methods, credentials: true };
  } else {
    cors = 'false';
  }
  server.applyMiddleware({ app, path: '/graphql', cors });
}

module.exports = { installHandler };
