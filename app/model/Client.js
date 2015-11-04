'use strict';

var request = require('sync-request');

function ws_get(path) {
    return JSON.parse(request('GET', module.parent.exports.WS_URL + path).getBody('utf8'));
};

class Client {
    constructor(id) {
        this.id = parseInt(id);
        this.load();
    }

    id() {
        return this.id;
    }

    firstName() {
        return this.id;
    }

    secondName() {
        return this.id;
    }

    get portfolio() {
        return ws_get('/client/portfolio/' + this.id);
    }

    get valo() {
        return ws_get('/client/valo/' + this.id);
    }

    get trades() {
        return ws_get('/client/trades/' + this.id);
    }

    load(done) {
        var client = ws_get('/client/desc/' + this.id);

        for (var p in client) {
            this[p] = client[p];
        }
    }
}

module.exports = Client;