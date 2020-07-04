const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const fs = require('fs');

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

function setAboutMessage(_, { message }) {
    return aboutMessage = message;
}

function issueList() {
    return issuesDB;
}

const resolvers = {
    Query: {
        about: () => aboutMessage,
        issueList
    },
    Mutation: {
        setAboutMessage // Object property shorthand, same as { setAboutMessage: setAboutMessage }
    }
}

const server = new ApolloServer({
    typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'),
    resolvers
});

const app = express();

app.use(express.static('public'));

server.applyMiddleware({ app, path: '/graphql' });

app.listen(3000, function() {
    console.log("Server listening on port 3000.");
});