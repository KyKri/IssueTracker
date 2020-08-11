// Imports
const express = require('express');
const proxy = require('http-proxy-middleware');
require('dotenv').config();

// Variables
const port = process.env.UI_SERVER_PORT || 8000;
const apiProxyTarget = process.env.API_PROXY_TARGET;
const UI_API_ENDPOINT = process.env.UI_API_ENDPOINT || 'http://localhost:3000/graphql';
const env = { UI_API_ENDPOINT };

// Express config
const app = express();
app.use(express.static('public'));

if (apiProxyTarget) {
  app.use('/graphql', proxy({ target: apiProxyTarget }));
}

app.get('/env.js', (req, res) => {
  res.send(`window.ENV = ${JSON.stringify(env)}`);
});

app.listen(port, () => {
  console.log(`UI server listening on port ${port}`);
});
