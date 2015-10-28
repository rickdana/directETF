'strict mode';

var express = require('express')
  , serveStatic = require('serve-static')
  , url = require('url')
  , path = require('path')
  , morgan = require('morgan');

var app = express();

// Load env config
var env = process.env.NODE_ENV || "dev"
  , config;

try {
  config = require('./app-' + env + '.json');
} catch (e) {
  console.error("No such config file for env '%s'!", env);
  process.exit(1);
}

// Morgan logger
app.use(morgan('combined'));

// Log in route
app.post('/login',
  //passport.authenticate('local'),
  function(req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    //console.log(req.user.username)
    res.redirect('/dashboard/');
  });

//app.post('/login',
//  passport.authenticate('local', { successRedirect: '/dashboard',
//                                   failureRedirect: '/login',
//                                   failureFlash: true }));

// Log Out route
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// Serve static files on /app
app.use(serveStatic(path.join(process.cwd(), '/app')));

// Specific route for client to get address of ws's host
app.get('/config/ws/host', function (req, res) {
  res.send(config.WS_URL);
});

// Route of *.html
app.get(/^\/.+\.html$/, function (req, res) {
  var url_parsed = url.parse(req.url, true);
  var pathname = url_parsed.pathname;

  if (pathname == "/") {
    pathname = "/index.html";
  }

  res.sendFile(__dirname + pathname);
});

// Launch express server
var server = app.listen(config.EXPRESS_PORT, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Listening at http://%s:%s', host, port);
});

