var express = require('express');
var serveStatic = require('serve-static');
var url = require('url');

var app = express();

var env = process.env.NODE_ENV || "production";
var config;

if (env == "production") {
  config = require('./app-aws.json');
} else {
  config = require('./app-dev.json');
}

app.get(/^\/(app.js|app-aws\.json|app-dev\.json)$/i, function (req, res) {
  res.status(404);
  res.send("Not Found");
});

app.use(serveStatic(__dirname));

app.get('/config/ws/host', function (req, res) {
  res.send(config.WS_URL);
});

app.get(/^\/.+\.html$/, function (req, res) {
  var url_parsed = url.parse(req.url, true);
  var pathname = url_parsed.pathname;

  if (pathname == "/") {
    pathname = "/index.html";
  }

  res.sendFile(__dirname + pathname);
});

var server = app.listen(config.EXPRESS_PORT, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

