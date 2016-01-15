#!/usr/bin/env node

'use strict';

// Module Dependencies
var express = require('express')
  , http = require('http')
  , url = require('url')
  , fs = require('fs')
  , path = require('path')
  , logger = require('morgan')
  , FileStreamRotator = require('file-stream-rotator')
  , serveStatic = require('serve-static')
  , favicon = require('serve-favicon')
  , cookieParser = require('cookie-parser')
  , bodyParser = require('body-parser');

// Load env config
var env = process.env.NODE_ENV || "aws"
  , config;

console.log("Starting with environnement: "+env);

try {
  config = require('./app-' + env + '.json');
} catch (e) {
  console.error("No such config file for env '%s'!", env);
  process.exit(1);
}

// Create an express instance
var app = require('express')();

const APP_DIR = path.join(process.cwd(), 'app');

// Exports
//module.exports.config = config;
//module.exports.app = app;

// Logger
if (env == 'dev') {
  app.use(logger('dev'));
} else {
  // log file rotation
  var logDirectory = __dirname + '/log'

  // ensure log directory exists
  fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory)

  // create a rotating write stream
  var accessLogStream = FileStreamRotator.getStream({
    filename: logDirectory + '/access-%DATE%.log',
    frequency: 'daily',
    verbose: false
  })

  // setup the logger
  app.use(logger(config.MORGAN_FORMAT || 'combined', {stream: accessLogStream}))
}

// Binding
app.use(favicon(path.join(APP_DIR, 'public/assets/favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

var passport = require('./passport')(app);

/**
 * Routing
 */

// As with any middleware it is quintessential to call next()
// if the user is authenticated
var isAuthenticated = function (req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

var protected_dir = path.join(APP_DIR, '/protected');

app.get('/logout', function(req, res, next) {
    if (req.isAuthenticated()) {
        req.logout();
    }
    res.redirect('/');
});

app.head('/login', function(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.sendStatus(401);
    }
    res.sendStatus(200);
});

app.post('/login', function(req, res, next) {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/dashboard');
}, passport.authenticate('login'), function(req, res, next) {
    res.sendStatus(200);
});

app.post('/signup', passport.authenticate('signup'), function(req, res, next) {
    res.sendStatus(200);
});

['/protected', '/dashboard'].forEach(function(route) {
    app.use(route, function(req, res, next) {
        if (!req.isAuthenticated()) {
            return res.redirect('/');
    //            return res.sendStatus(401);
        }
        return next();
    });
});

// Serve common static files
app.get('/essai/main.js', function(req, res, next) {
    // Append WS_HOST config to the file content
    fs.readFile(path.join(APP_DIR, '/public/pages/essai/main.js'), 'utf8', function (err, main_content) {
        if (err) {
            return next(err);
        }

        var ws_content = 'WS_URL = "' + config.WS_URL + '";';

        res.type('text/javascript')
           .status(200)
           .end(ws_content + main_content);
    });
});

app.get('/protected/pages/dashboard/main.js', isAuthenticated, function(req, res, next) {
    // Append WS_HOST config to the file content
    fs.readFile(path.join(protected_dir, '/pages/dashboard/main.js'), 'utf8', function (err, main_content) {
        if (err) {
            return next(err);
        }

        var ws_content = '\nWS_URL = "' + config.WS_URL + '";CLIENT_ID = "' + req.user.id;
        ws_content += '";CLIENT_FIRST_NAME="' + req.user.firstName + '"';

        res.type('text/javascript')
            .status(200)
            .end(main_content + ws_content);
    });
});

app.get('/dashboard', function(req, res){
    res.sendFile(path.join(APP_DIR, '/protected/pages/dashboard/index.html'));
});

app.use(serveStatic(APP_DIR));
app.use(serveStatic(path.join(APP_DIR, 'public/pages')));
app.use(serveStatic(path.join(APP_DIR, '/bower_components')));

// view engine setup
app.set('views', path.join(__dirname, '/jade'));
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
        console.error(err);
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
    res.status(err.status || 500);
    res.render('error', {
        title: err.title || 'Internal Server Error',
        message: err.message,
        error: {}
    });
});



/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(config.EXPRESS_PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
           ? 'Pipe ' + port
           : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
           ? 'pipe ' + addr
           : 'port ' + addr.port;
  console.log('Listening on ' + bind);
}

