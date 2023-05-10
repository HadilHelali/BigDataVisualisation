const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();

// Replace the connection string with your MongoDB Compass connection string
const uri = 'mongodb://localhost:16010';

// Replace <database-name> with the name of the database you want to connect to
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.set('view engine', 'ejs');

let types = []; // Declare types variable here
let counts = []; // Declare counts variable here
const incidents = [];


// Start collecting data every 6 seconds
setInterval(() => {
  // Your code for collecting data goes here
  client.connect((err) => {
    if (err) {
      console.error(err);
      return;
    }

    const db= client.db('fire-calls');
    const collection_batch = db.collection('fire-calls-batch');
    const collection_spark = db.collection('fire-calls-spark');

    collection_batch.find().toArray((err, docs) => {
      if (err) {
        console.error(err);
        return;
      }
      types = []; // Reset types array
      counts = []; // Reset counts array

      docs.forEach((doc) => {
        types.push(doc['type']);
        counts.push(doc['count']);
      });
    });

    
    collection_spark.find().limit(10).toArray((err, docs) => {
      if (err) {
        console.error(err);
        return;
      }
      docs.forEach((doc) => {
        incidents.push(doc);
      });
    });
  });
}, 6000);

app.get('/', (req, res) => {
  res.render('index', { types: types, counts: counts ,incidents: incidents});
});

// Start the server and listen on port 3000
app.listen(3000, () => {
  console.log(`Server listening at http://localhost:3000`);
});
