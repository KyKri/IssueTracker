// Imports
const express = require('express');
const fs = require('fs');
const { ApolloServer } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');

// Variables
let aboutMessage = "Issue Tracker API v1.0";
const issuesDB = [
    {
        id: 1,
        status: 'New',
        owner: 'Ravan',
        effort: 5,
        created: new Date('2018-08-15'),
        due: undefined,
        title: 'Error in console when clicking Add'
    },
    {
        id: 2,
        status: 'Assigned',
        owner: 'Eddie',
        effort: 14,
        created: new Date('2018-08-16'),
        due: new Date('2018-08-30'),
        title: 'Missing bottom border on panel'
    }
];

// Query resolvers
function issueList() {
    return issuesDB;
}

// Mutation resolvers
function setAboutMessage(_, { message }) {
    return aboutMessage = message;
}

function issueAdd(_, { issue }) {
    issue.created = new Date();
    issue.id = issuesDB.length + 1;
    if (issue.status == undefined) { issue.status = 'New'; }
    issuesDB.push(issue);
    return issue;
}

// Custom type resolvers
const GraphQLDate = new GraphQLScalarType({
    name: 'GraphQLDate',
    description: '',
    serialize(value) {
        return value.toISOString();
    },
    parseLiteral(ast) {
        return (ast.kind == Kind.STRING) ? new Date(ast.value) : undefined;
    },
    parseValue(value) {
        return new Date(value);
    }
});

// GraphQL resolvers
const resolvers = {
    Query: {
        about: () => aboutMessage,
        issueList
    },
    Mutation: {
        setAboutMessage, // Object property shorthand, same as { setAboutMessage: setAboutMessage }
        issueAdd
    },
    GraphQLDate
}

// ApolloServer config
const server = new ApolloServer({
    typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'),
    resolvers
});

// Express config
const app = express();

app.use(express.static('public'));

server.applyMiddleware({ app, path: '/graphql' });

app.listen(3000, function() {
    console.log("Server listening on port 3000.");
});