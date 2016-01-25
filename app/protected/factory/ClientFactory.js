angular.module('DirectETF')
    .factory('$ClientFactory', function($http, $EtfsFactory) {
        var client = {
            id: CLIENT_ID,
            profile: null,
            portfolio: {
                infos: null,
                valo: [],
                value: 0.0,
                etfsValue: 0.0,
                trades: [],
                gains: 0.0
            }
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

        function clone_object(src, dest) {
            for (var p in src) {
                if (typeof src[p] == 'object' && src[p] !== null) {
                     clone_object(src[p], dest[p])
                } else if (src[p] instanceof Array) {
                    dest[p] = src[p].slice(0);
                } else {
                    dest[p] = src[p];
                }
            }
        }

        return {
            id: client.id,
            profile: function(done) {
                if (client.profile) {
                    return done(false, client.profile);
                }

                $http.get(WS_URL + '/client/desc/' + client.id)
                    .success(function(profile) {
                        profile.alreadyInvest = profile.firstName.length > 0; // just for demo
                        profile.firstName = profile.firstName || CLIENT_FIRST_NAME; // just for demo

                        done(false, client.profile = profile)
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
                    $http.get(WS_URL + '/client/portfolio/' + client.id)
                        .success(function(portfolio) {
                            var currency = typeof portfolio['dividends']['EUR'] != 'undefined' ? 'EUR' : 'USD';
                            var isins = [];

                            for (var isin in portfolio.etfs) {
                                isins.push(isin);
                            }

                            client.portfolio.infos = {
                                goal: portfolio.investorProfile.goal,
                                risk: portfolio.investorProfile.risk,
                                amountMonthly: portfolio.investorProfile.amountMonthly,
                                timeframe: portfolio.investorProfile.timeframe,
                                currency: currency,
                                currencySymb: currency == 'EUR' ? '€' : '$',
                                dividends: portfolio['dividends'][currency],
                                cash: portfolio.cash[currency],
                                etfs: portfolio.etfs,
                                strategy: portfolio.strategy,
                                description: portfolio.textDescription,
                                isins: isins,
                            };

                            done(false, client.portfolio.infos);
                        })
                        .error(function(data, status, headers, config) {
                            var err = new Error("Failed to load portfolio of ClientID " + client.id);

                            err.status = status;
                            err.headers = headers;

                            if (typeof done == 'function') {
                                done(err, null);
                            }

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

                            client.portfolio.valo = [angular.copy(valo), data_valo];

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

                        if (client.profile.alreadyInvest) {
                            client.portfolio.value = data_valo.length
                                ? data_valo[data_valo.length - 1][1]
                                : 0;
                        } else {
                            client.portfolio.value = 0;
                        }

                        done(false, client.portfolio.value);
                    });
                },
                trades: function(done) {
                    if (client.portfolio.trades.length) {
                        return done(false, client.portfolio.trades);
                    }

                    $http.get(WS_URL + '/client/trades/' + client.id)
                        .success(function(trades) {
                            client.portfolio.trades = angular.copy(trades)

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
                //all the TYPE STOCKIN and CASHIN in the trades according to the value's data in the wallet
                tradesByDate: function(done) {
                    if (client.portfolio.tradesByDate) {
                        return done(false, client.portfolio.tradesByDate);
                    }

                    var self = this;

                    this.valo(function(err, valo, data_valo) {
                        if (err) {
                            return done(err, null);
                        }

                        self.trades(function(err, trades) {
                            if (err) {
                                return done(err, null);
                            }

                            var somme_trades = 0;
                            var trades_by_date = {};

                            for (var x in data_valo) {
                                for (var i in trades) {
                                    if ((trades[i].type == 'CASHIN' || trades[i].type == 'STOCKIN') && data_valo[x][0] == new Date(trades[i].date).getTime()) {
                                        somme_trades += trades[i].cash;
                                    }
                                }
                                trades_by_date[new Date(data_valo[x][0])] = somme_trades;
                            }

                            client.portfolio.tradesByDate = trades_by_date;

                            done(false, trades_by_date);
                        });
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

                        client.portfolio.gains = gains;

                        done(false, gains);
                    });
                },
            },
            settings: {
                profile: {
                    save: function (profile, done) {
                        clone_object(profile, client.profile);

                        $http.post(WS_URL + '/client/desc/' + client.id, client.profile)
                            .success(function(portfolio) {
                                done(false, client.profile);
                            })
                            .error(function(data, status, headers, config) {
                                var err = new Error("Failed to save profile of ClientID " + client.id);

                                err.status = status;
                                err.headers = headers;

                                if (typeof done == 'function') {
                                    done(err, null);
                                }

                                console.error(err.message);
                            });
                    }
                },
                portfolio: {
                    save: function (portfolio, done) {
                        clone_object(portfolio.infos, client.portfolio.infos);

                        $http.post(WS_URL + '/client/portfolio/' + client.id, client.portfolio.infos)
                            .success(function(portfolio) {
                                done(false, client.portfolio.infos);
                            })
                            .error(function(data, status, headers, config) {
                                var err = new Error("Failed to save portfolio of ClientID " + client.id);

                                err.status = status;
                                err.headers = headers;

                                if (typeof done == 'function') {
                                    done(err, null);
                                }

                                console.error(err.message);
                            });
                    }
                },
            }
        };
    });