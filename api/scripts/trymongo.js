// imports
const { MongoClient } = require('mongodb');
require('dotenv').config();

// vars and consts
const url = process.env.DB_URL || 'mongodb://localhost/issueTracker';
const client = new MongoClient(url, { useNewUrlParser: true });
const employee1 = { id: 1, name: 'A. Callback', age: 23 };
const employee2 = { id: 2, name: 'B. Async', age: 23 };

function testWithCallbacks(callback) {
  console.log('\n--- testWithCallbacks ---');

  client.connect((conErr) => {
    if (conErr) {
      callback(conErr);
      return;
    }

    console.log('Connected to MongoDB.');

    const db = client.db();
    const collection = db.collection('employees');

    collection.insertOne(employee1, (insertErr, result) => {
      if (insertErr) {
        client.close();
        callback(insertErr);
        return;
      }

      console.log(`Result of insert: ${result.insertedId}`);

      collection.find({ _id: result.insertedId })
        .toArray(
          (findErr, docs) => {
            if (findErr) {
              client.close();
              callback(findErr);
              return;
            }
            console.log(`Result of find: ${docs}`);
            client.close();
            callback(findErr);
          },
        );
    });
  });
}

async function testWithAsync() {
  console.log('\n--- Test with async ---');
  try {
    await client.connect();

    console.log('Connected to mongo.');

    const db = client.db();
    const collection = db.collection('employees');
    const result = await collection.insertOne(employee2);

    console.log(`Result of insert:\n${result.insertedId}`);

    const docs = await collection.find({ _id: result.insertedId })
      .toArray();

    console.log(`Result of find:\n${docs}`);
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
}

testWithCallbacks((err) => {
  if (err) {
    console.log(err);
  }
});

testWithAsync();
