/**
 * local mongo command: mongo issueTracker scripts/init.mongo.js
 */

/* global db print */
/* eslint no-restricted-globals: "off" */

const issues = [
  {
    id: 1,
    status: 'New',
    owner: 'Ravan',
    effort: 5,
    created: new Date('2018-08-15'),
    due: undefined,
    title: 'Error in console when clicking Add',
    description: 'Steps to reproduce the error:'
    + '\n1. Refresh the browser'
    + '\n2. Select New in the filter'
    + '\n3. Refresh again. Note the warning in the console'
    + '\n4. Click on Add'
    + '\n5. There is an error in the console and Add doesn\'t work',
  },
  {
    id: 2,
    status: 'Assigned',
    owner: 'Eddie',
    effort: 14,
    created: new Date('2018-08-16'),
    due: new Date('2018-08-30'),
    title: 'Missing bottom border on panel',
    description: 'There needs to be a border in the bottom panel'
    + ' that appears when clicking on Add',
  },
];

db.issues.remove({});
db.deleted_issues.remove({});
db.issues.insertMany(issues);
const count = db.issues.count();
print(`Inserted ${count} issues.`);

db.counters.remove({ _id: 'issues' });
db.counters.insert({ _id: 'issues', current: count });

db.issues.createIndex({ id: 1 }, { unique: true });
db.issues.createIndex({ status: 1 });
db.issues.createIndex({ owner: 1 });
db.issues.createIndex({ created: 1 });

db.deleted_issues.createIndex({ id: 1 }, { unique: true });
