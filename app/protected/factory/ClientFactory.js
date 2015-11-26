angular.module('MetronicApp')
    .factory('$ClientFactory', function($http, $EtfsFactory, $PortfolioFactory) {
        var client = {
            id: $.cookie('client_id') || '1',
            profile: null,
            portfolio: {
                info: null,
                valo: [],
                value: 0.0,
                etfsValue: 0.0,
                trades: [],
                gains: 0.0
            },
        };

        function gains_by_etf(etf, trades) {
            var sum_trades = etf.quantity * etf.price;

            for (var i = 0, n = trades.length; i < n; i++) {
                if (trades[i].isin == etf.isin) {
                    // BUY, STOCKIN, SELL
                    switch (trades[i].type) {
                        case 'BUY' :
                        case 'STOCKIN':
                            sum_trades -= trades[i].cash;
                            break;

                        case 'SELL':
                            sum_trades += trades[i].cash;
                            break;
                    }
                }
            }

            return sum_trades;
        }

        return {
            id: client.id,
            profile: function(done) {
                if (client.profile) {
                    return done(false, client.profile);
                }

                $http.get(WS_URL + '/client/desc/' + client.id)
                    .success(function(profile) {
                        client.profile = profile;
                        done(false, client.profile)
                    })
                    .error(function(data, status, headers, config) {
                        var err = new Error("Failed to load profile of ClientID " + client.id);

                        err.status = status;
                        err.headers = headers;

                        cb(err, null);

                        console.error(err.message);
                    });
            },
            portfolio: {
                infos: function(done) {
                    if (client.portfolio.info) {
                        return done(false, client.portfolio.infos);
                    }

                    $http.get(WS_URL + '/client/portfolio/' + client.id)
                        .success(function(portofolio) {
                            var currency = typeof portofolio['dividends']['EUR'] != 'undefined' ? 'EUR' : 'USD';

                            client.portfolio.infos = {
                                currency: currency,
                                currencySymb: currency == 'EUR' ? '€' : '$',
                                dividends: portofolio['dividends'][currency],
                                cash: portofolio.cash[currency],
                                etfs: portofolio.etf,
                            };

                            done(false, client.portfolio.infos);
                        })
                        .error(function(data, status, headers, config) {
                            var err = new Error("Failed to load portfolio of ClientID " + client.id);

                            err.status = status;
                            err.headers = headers;

                            cb(err, null);

                            console.error(err.message);
                        });
                },
                valo: function(done) {
                    if (client.portfolio.valo.length) {
                        return done(false, client.portfolio.valo[0], client.portfolio.valo[1]);
                    }

                    $http.get(WS_URL + '/client/valo/' + client.id)
                        .success(function(valo) {
                            var data_valo = [];

                            for (var date in valo) {
                                data_valo.push([new Date(date).getTime(), valo[date]]);
                            }

                            data_valo.sort(function (a, b) {
                                return a[0] - b[0];
                            });

                            client.portfolio.valo = [valo, data_valo];

                            done(false, valo, data_valo);
                        })
                        .error(function(data, status, headers, config) {
                            var err = new Error("Failed to load portfolio valo of ClientID " + client.id);

                            err.status = status;
                            err.headers = headers;

                            cb(err, null, null);

                            console.error(err.message);
                        });
                },
                value: function(done) {
                    if (client.portfolio.value) {
                        return done(false, client.portfolio.value);
                    }

                    this.valo(function(err, valo, data_valo) {
                        if (err) {
                            return done(err, null);
                        }

                        client.portfolio.value = data_valo[data_valo.length - 1][1];

                        done(false, client.portfolio.value);
                    });
                },
                trades: function(done) {
                    if (client.portfolio.trades.length) {
                        return done(false, client.portfolio.trades);
                    }

                    $http.get(WS_URL + '/client/trades/' + client.id)
                        .success(function(trades) {
                            done(false, trades);
                        })
                        .error(function(data, status, headers, config) {
                            var err = new Error("Failed to load portfolio trades of ClientID " + client.id);

                            err.status = status;
                            err.headers = headers;

                            cb(err, null);

                            console.error(err.message);
                        });
                },
                etfs: function(done) {
                    var self = this;

                    this.infos(function(err, infos) {
                        if (err) {
                            return done(err, null);
                        }

                        $EtfsFactory.load(infos.etfs, function(etfs) {
                            self.trades(function(err, trades) {
                                if (err) {
                                    return done(err, null);
                                }

                                for (var i = 0; i < etfs.length; i++) {
                                    etfs[i].gains = gains_by_etf(etfs[i], trades);
                                }

                                done(false, etfs);
                            });
                        });
                    });
                },
                etfsValue: function(done) {
                    if (client.portfolio.etfsValue) {
                        return done(false, client.portfolio.etfsValue);
                    }

                    this.etfs(function(err, etfs) {
                        if (err) {
                            return done(err, null);
                        }

                        var value = 0;

                        for (var i = 0; i < etfs.length; i++) {
                            value += etfs[i].price * etfs[i].quantity;
                        }

                        client.portfolio.etfsValue = value;

                        done(false, client.portfolio.etfsValue);
                    });
                },
                gains: function(done) {
                    if (client.portfolio.gains) {
                        return done(false, client.portfolio.gains);
                    }

                    this.etfs(function(err, etfs) {
                        if (err) {
                            return done(err, null);
                        }

                        var gains = 0;

                        for (var i = 0; i < etfs.length; i++) {
                            gains += etfs[i].gains;
                        }

                        done(false, gains);
                    });
                },
            }
        };
    });