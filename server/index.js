#!/usr/bin/env node

'use strict';

// Module Dependencies
var express = require('express')
  , http = require('http')
  , url = require('url')
  , fs = require('fs')
  , path = require('path')
  , logger = require('morgan')
  , FileStreamRotator = require('file-stream-rotator');

// Load env config
var env = process.env.NODE_ENV || "aws"
  , config;

try {
  config = require('./app-' + env + '.json');
} catch (e) {
  console.error("No such config file for env '%s'!", env);
  process.exit(1);
}

// Create an express instance
var app = require('express')();

// Exports
module.exports.config = config;
module.exports.app = app;

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

// Load app
var app = require(path.join(process.cwd(), '/app'));

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

