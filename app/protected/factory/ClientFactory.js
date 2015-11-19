angular.module('MetronicApp')
    .factory('$ClientFactory', ['$http', '$EtfsFactory', function($http, $EtfsFactory) {
        var client = {
            id: $.cookie('client_id') || '1',
            wallet: {},
            valo: {},
            trades: [],
            etfs: []
        };

        return {
            id: client.id,
            desc: function(done) {
                $http.get(WS_URL + '/client/desc/' + client.id)
                    .success(done);
            },
            wallet: function(done) {
                $http.get(WS_URL + '/client/portfolio/' + client.id)
                    .success(done);
            },
            valo: function(done) {
                $http.get(WS_URL + '/client/valo/' + client.id)
                    .success(done);
            },
            trades: function(done) {
                $http.get(WS_URL + '/client/trades/' + client.id)
                    .success(done);
            },
            etfs: function(done) {
                this.wallet(function (wallet) {
                    $EtfsFactory.load(wallet.etf, done);
                });
            },
        };
    }]);