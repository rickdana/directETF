"use strict";

var bcrypt   = require('bcrypt-nodejs');

// generating a hash
function generateHash(password) {
    return password;
//    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

var db = {
    'demo@directetf.com': {
        "id": 1,
        "secondName": "Depardieu",
        "firstName": "Gérard",
        password: generateHash('demo')
    },
    'user1@directetf.com': {
        "id": 2,
        "secondName": "Roberts",
        "firstName": "Julia",
        password: generateHash('user1')
    },
    'user2@directetf.com': {
        "id": 3,
        "secondName": "Bullock",
        "firstName": "Sandra",
        password: generateHash('user2')
    }
};

var id = 3;

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

    db[email].id = ++id;
    db[email].email = email;

    return db[email];
};

module.exports = {
    prototype: User,
    get: u,
    instance: instance
}