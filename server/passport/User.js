"use strict";

var bcrypt   = require('bcrypt-nodejs');

// generating a hash
function generateHash(password) {
    return password;
//    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

var db = {
    'demo@directetf.com': {
        firstName: 'Demo',
        secondName: 'User',
        password: generateHash('demo')
    },
    'user1@directetf.com': {
        firstName: 'Gérard',
        secondName: 'D.',
        password: generateHash('user1')
    },
    'user2@directetf.com': {
        firstName: 'Julia',
        secondName: 'R.',
        password: generateHash('user2')
    },
    'user3@directetf.com': {
        firstName: 'Sandra',
        secondName: 'B.',
        password: generateHash('user3')
    },
    'user4@directetf.com': {
        firstName: 'Brad',
        secondName: 'P.',
        password: generateHash('user4')
    }
};

var User = {
    setPassword: function (password) {
        this.password = generateHash(password);
    },

    save: function (done) {
        done(false);
    },

    validPassword: function (pwd) {
        return generateHash(pwd) == db[this.email].password;
        //    return bcrypt.compareSync(generateHash(pwd), db[this.email]);
    },

    findById: function (query, done) {
        if (typeof db[query.email] != 'undefined') {
            done(false, new u(query.email));
        } else {
            done(true, false);
        }
    },

    findOne: function (query, done) {
       if (typeof db[query.email] != 'undefined') {
           done(false, new u(query.email));
       } else {
           done(false, false);
       }
    }
};

function u(email) {
    if (typeof db[email] == 'undefined') {
        throw Error('No user ' + email + 'found');
    }

    for (var p in User) {
        db[email][p] = User[p];
    }

    db[email].email = email;

    return db[email];
};

function instance(email) {
    db[email] = {};

    for (var p in User) {
        db[email][p] = User[p];
    }

    db[email].email = email;

    return db[email];
};

module.exports = {
    prototype: User,
    get: u,
    instance: instance
}