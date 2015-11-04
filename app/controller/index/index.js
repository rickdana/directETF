'strict mode';

var route = require('express').Router()
  , path = require('path')
  , serveStatic = require('serve-static');

const VIEW_DIR = path.join(module.parent.exports.VIEW_DIR, '/index');

// Serve static files
route.use(serveStatic(VIEW_DIR));

// Index route
route.get('/', function (req, res) {
  res.sendFile(path.join(VIEW_DIR, '/index.html'));
});

module.exports = route;