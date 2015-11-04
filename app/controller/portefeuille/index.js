'strict mode';

var express = require('express');

var index = express.Router();

index.get('/', function(req, res) {
  res.send(req.originalUrl);
});

module.exports = index;