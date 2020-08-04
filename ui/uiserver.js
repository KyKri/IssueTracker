// Imports
const express = require('express');
const app = express();
require('dotenv').config();

// Variables
const port = process.env.UI_SERVER_PORT || 8000;

// Express config

app.use(express.static('public'));

app.listen(port, () => {
    console.log(`UI server listening on port ${port}`);
});