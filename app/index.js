'use strict';

// Module Dependencies
var serveStatic = require('serve-static')
  , fs = require('fs')
  , path = require('path')
  , favicon = require('serve-favicon')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser');

var app = module.parent.exports.app;

// Directories
const CONTROLLER_DIR = path.join(__dirname, '/controller')
    , CONFIG_FIR = path.join(__dirname, '/config')
    , VIEW_DIR = path.join(__dirname, '/view');

// Config
const config = module.parent.exports.config;

// Binding
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

var passport = require('./service/passport')(app);

// Temporary config exports for controllers
module.exports.CONFIG_FIR = CONFIG_FIR;
module.exports.VIEW_DIR = VIEW_DIR;

// Routes
app.use('/account', require(path.join(CONTROLLER_DIR, '/account'))(passport));
app.use('/dashboard', require(path.join(CONTROLLER_DIR, '/dashboard'))(config.WS_URL));
app.use(require(path.join(CONTROLLER_DIR, '/index')));

// Serve common static files
app.use(serveStatic(path.join(__dirname, '/public')));
app.use(serveStatic(path.join(__dirname, '/bower_components')));

// view engine setup
app.set('views', path.join(__dirname));
app.set('view engine', 'jade');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Page Not Found');
  err.title = 'Page Not Found';
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (process.env.NODE_ENV === 'dev') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      title: err.title || 'Internal Server Error',
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    console.error(err)
//  if (!res.headersSent) {
    res.status(err.status || 500);
    res.render('error', {
      title: err.title || 'Internal Server Error',
      message: err.message,
      error: {}
    });
//  }
});

module.exports = app;