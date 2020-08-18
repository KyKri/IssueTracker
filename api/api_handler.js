const fs = require('fs');
const { ApolloServer } = require('apollo-server-express');
const GraphQLDate = require('./graphql_date');
const about = require('./about');
const issue = require('./issue');
require('dotenv').config();

// GraphQL resolvers
const resolvers = {
  Query: {
    about: about.getMessage,
    issueList: issue.list,
  },
  Mutation: {
    setAboutMessage: about.setMessage,
    issueAdd: issue.add,
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

function installHandler(app) {
  const enableCORS = (process.env.ENABLE_CORS || 'true') === 'true'; // env var is a String, not a boolean
  console.log('CORS setting', enableCORS);
  server.applyMiddleware({ app, path: '/graphql', cors: enableCORS });
}

module.exports = { installHandler };
