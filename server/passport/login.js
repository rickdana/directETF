"use strict";

var LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport, User) {
    passport.use('login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback : true
      },
      function(req, username, password, done) {
        console.log("User.findOne({ 'email' :  username } === " + username)
        // check in mongo if a user with username exists or not
        User.prototype.findOne({ 'email' :  username },
          function(err, user) {
            // In case of any error, return using the done method
            if (err)
              return done(err);
            // Username does not exist, log error & redirect back
            if (!user){
              console.log('User Not Found with username '+username);
              return done(null, false,
                    req.flash('message', 'User Not found.'));
            }
            // User exists but wrong password, log the error
            if (!user.validPassword(password)){
              console.log('Invalid Password');
              return done(null, false,
                  req.flash('message', 'Invalid Password'));
            }
            // User and password both match, return user from
            // done method which will be treated like success
            return done(null, user);
          }
        );
    }));
};