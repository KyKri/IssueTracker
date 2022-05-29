// Imports
const express = require('express');
const cookieParser = require('cookie-parser');
const auth = require('./auth.js');
const { connectToDb } = require('./db');
const { installHandler } = require('./api_handler.js');
require('dotenv').config();

// Variables
const port = process.env.API_SERVER_PORT || 3000;

// Express config
const app = express();

app.use(cookieParser());
app.use('/auth', auth.routes);

installHandler(app);

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
