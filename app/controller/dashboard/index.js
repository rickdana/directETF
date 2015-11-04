"use strict";

var express = require('express')
  , router = express.Router()
  , fs = require('fs')
  , path = require('path')
  , serveStatic = require('serve-static');

const VIEW_DIR = path.join(module.parent.exports.VIEW_DIR, '/dashboard');

// As with any middleware it is quintessential to call next()
// if the user is authenticated
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/account/login');
}

module.exports = function(ws_url) {

    // Specific route
    router.get('/main.js', isAuthenticated, function(req, res) {
      // Append WS_HOST config to the file content
      fs.readFile(path.join(VIEW_DIR, 'main.js'), 'utf8', function (err, main_content) {
        if (err) {
          return next(err);
        }

        var ws_content = '\nWS_URL = "' + ws_url + '";';

        res.type('text/javascript')
           .status(200)
           .end(main_content + ws_content);
      });
    });

    // Serve static files
    router.use(isAuthenticated, serveStatic(VIEW_DIR));

    // Index route
    router.get('/', isAuthenticated, function(req, res) {
        res.sendFile(path.join(VIEW_DIR, '/index.html'));
    });

    return router;
};