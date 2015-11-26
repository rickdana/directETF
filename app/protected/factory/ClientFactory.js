angular.module('MetronicApp')
    .factory('$ClientFactory', function($http, $EtfsFactory) {
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
            portofolio: function(done) {
                $http.get(WS_URL + '/client/portfolio/' + client.id)
                    .success(function(portofolio) {
                        var currency = typeof portofolio['dividends']['EUR'] != 'undefined' ? 'EUR' : 'USD';

                        done({
                            currency: currency,
                            dividends: portofolio['dividends'][currency],
                            cash: portofolio.cash[currency],
                            etfs: portofolio.etf,
                        })
                    });
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
                this.portofolio(function (wallet) {
                    $EtfsFactory.load(wallet.etf, done);
                });
            },
        };
    });