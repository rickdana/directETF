"use strict";

var session = require('express-session')
  , router = require('express').Router()
  , flash = require('connect-flash')
  , path = require('path');

// Configuring Passport
var passport = require('passport');
var User = require('./User');

module.exports = function(app) {
    app.use(session({
        secret: 'TODO SET REDIS SECRET KEY HERE',
//        cookie: { maxAge: 60000 },
        resave: true,
        saveUninitialized: true
    }));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done) {
        done(null, user.email);
    });

    passport.deserializeUser(function(email, done) {
        User.prototype.findById({email: email}, function(err, user) {
            done(err, user);
        });
    });

    require('./login')(passport, User);
    require('./signup')(passport, User);

    return passport;
};