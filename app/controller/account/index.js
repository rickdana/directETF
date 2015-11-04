"use strict";

var express = require('express')
  , app = express()
  , router = express.Router()
  , path = require('path')
  , serveStatic = require('serve-static');

const VIEW_DIR = path.join(module.parent.exports.VIEW_DIR, '/account')
    , CONFIG_FIR = module.parent.exports.CONFIG_FIR;

app.set('view engine', 'jade');

function render_file(name) {
    return path.join(__dirname, name + '.jade');
}

module.exports = function(passport){
    router.use(function (req, res, next) {
        if (req.isAuthenticated()) {
           return res.redirect('/dashboard');
        }
        return next();
    });

    /* GET login page. */
    router.get('/login', function(req, res) {
        // Display the Login page with any flash message, if any
        res.render(render_file('login'), { message: req.flash('message') });
    });

    /* Handle Login POST */
    router.post('/login', passport.authenticate('login', {
        successRedirect: '/dashboard',
        failureRedirect: '/account/login',
        failureFlash : true
    }));

    /* GET Registration Page */
    router.get('/signup', function(req, res){
        res.render(render_file('signup'),{message: req.flash('message')});
    });

    /* Handle Registration POST */
    router.post('/signup', passport.authenticate('signup', {
        successRedirect: '/dashboard',
        failureRedirect: '/account/signup',
        failureFlash : true
    }));

    /* Handle Logout */
    router.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
    });

    // Serve static files
    router.use(serveStatic(VIEW_DIR));

    return router;
};