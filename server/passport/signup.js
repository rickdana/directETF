"use strict";

var LocalStrategy = require('passport-local').Strategy;

module.exports = function (passport, User) {
    passport.use('signup', new LocalStrategy({
            usernameField: 'username',
            passwordField: 'password',
            passReqToCallback: true
        },
        function (req, username, password, done) {
            var findOrCreateUser = function () {
                // find a user in Mongo with provided username
                User.prototype.findOne({'email': username}, function (err, user) {
                    // In case of any error return
                    if (err) {
                        console.log('Error in SignUp: ' + err);
                        return done(err);
                    }
                    // already exists
                    if (user) {
                        console.log('User already exists');
                        return done(null, false, {message: 'User Already Exists'});
                    } else {
                        // if there is no user with that email
                        // create the user
                        var newUser = new User.instance(username);
                        // set the user's local credentials
                        newUser.setPassword(password);
                        newUser.firstName = req.param('firstName');
                        newUser.lastName = req.param('lastName');

                        // save the user
                        newUser.save(function (err) {
                            if (err) {
                                console.log('Error in Saving user: ' + err);
                                throw err;
                            }
                            console.log('User Registration succesful');
                            return done(null, newUser);
                        });
                    }
                });
            };

            // Delay the execution of findOrCreateUser and execute
            // the method in the next tick of the event loop
            process.nextTick(findOrCreateUser);
        })
    );
};