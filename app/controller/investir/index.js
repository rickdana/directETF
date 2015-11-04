'use strict';

var express = require('express');

module.exports.WS_URL = module.parent.exports.WS_URL;

var Client = require('../../model/Client');

var index = express.Router();

var c = new Client(1);

console.log(c)
console.log(c.firstName)
console.log(c.secondName)
//console.log(c.portfolio)
//console.log(c.valo)
//console.log(c.trades)

//process.exit(0)

index.get('/', function(req, res) {
  res.send(req.originalUrl);
});

module.exports = index;