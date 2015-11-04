"use strict";

var bcrypt   = require('bcrypt-nodejs');

// generating a hash
function generateHash(password) {
    return password;
//    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

var db = {
    'demo@directetf.com': {
        firstname: '',
        secondname: '',
        password: generateHash('demo')
    },
    'user1@directetf.com': {
        firstname: 'Gérard',
        secondname: 'Depardieu',
        password: generateHash('user1')
    },
    'user2@directetf.com': {
        firstname: 'Julia',
        secondname: 'Roberts',
        password: generateHash('user2')
    },
    'user3@directetf.com': {
        firstname: 'Sandra',
        secondname: 'Bullock',
        password: generateHash('user3')
    },
    'user4@directetf.com': {
        firstname: 'Brad',
        secondname: 'Pitt',
        password: generateHash('user4')
    }
};

module.exports = class User {
    constructor(email) {
        this.id = email;
    }

    get email() {
        return this.id;
    }

    setPassword(password) {
        this.password = generateHash(password);
    }

    get firstName() {
        return this.firstname;
    }

    set firstName(firstName) {
        this.firstname = firstName;
    }

    set secondName(secondName) {
        this.secondname = secondName;
    }

    get secondName() {
        return this.secondname;
    }

    save(done) {
        db[this.id] = {
            firstname: this.firstname,
            secondname: this.secondname
        };

        done(true);
    }

    validPassword(pwd) {
        return generateHash(pwd) == db[this.id].password;
        //    return bcrypt.compareSync(generateHash(pwd), db[this.id]);
    }

    static findById(query, done) {
        if (typeof db[query.email] != 'undefined') {
            done(false, new User(query.email));
        } else {
            done(true, false);
        }
    }

    static findOne(query, done) {
       if (typeof db[query.email] != 'undefined') {
           console.log(new User(query.email))
           done(false, new User(query.email));
       } else {
           done(true, false);
       }
    }
};