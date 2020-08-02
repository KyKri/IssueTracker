// Imports
const express = require('express');
const fs = require('fs');
const { ApolloServer, UserInputError } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql');
const { Kind } = require('graphql/language');
const { MongoClient } = require('mongodb');

// Variables
let aboutMessage = "Issue Tracker API v1.0";
let db;
const url = 'mongodb://localhost/issueTracker';

// Database
async function connectToDb() {
    const client = new MongoClient(url, {useNewUrlParser: true});
    await client.connect();
    
    console.log('Connected to DB');

    db = client.db();
}

async function getNextSequence(name) {
    const result = await db.collection('counters').findOneAndUpdate(
        { _id: name },
        { $inc: { current: 1 } },
        { returnOriginal: false }
    );
    
    return result.value.current;
}

// Validation
function validateIssue(issue) {
    const errors = [];

    if (issue.title.length < 3) {
        errors.push('Field "Title" must be at least 3 characters long.');
    }

    if (issue.status == 'Assigned' && !issue.owner) {
        errors.push('Field "Owner" is required when status is "Assigned".')
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
    return aboutMessage = message;
}

async function issueAdd(_, { issue }) {
    validateIssue(issue);

    issue.created = new Date();
    issue.id = await getNextSequence('issues');
    if (issue.status == undefined) { issue.status = 'New'; }

    const result = await db.collection('issues').insertOne(issue);
    const savedIssue = await db.collection('issues').findOne({_id: result.insertedId});
    
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
        const dateValue = new Date(ast.value);
        return isNaN(dateValue) ? undefined : dateValue;
    },
    parseValue(value) {
        const dateValue = new Date(value);
        return isNaN(dateValue) ? undefined : dateValue;
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
    resolvers,
    formatErrors: error => {
        console.log(error);
        return error;
    }
});

// Express config
const app = express();

app.use(express.static('public'));

server.applyMiddleware({ app, path: '/graphql' });

(async function() {
    try {
        await connectToDb();
        app.listen(3000, function() {
            console.log("Server listening on port 3000.");
        });
    } catch (err) {
        console.log(err);
    }
})();
