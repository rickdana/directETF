angular.module('DirectETF')
    .factory('$PortfolioFactory', function($http, $EtfsFactory) {
        var models = {},
            goals = [
                {
                    code: "just-invest",
                    label: "Juste investir",
                    tooltip: "Je souhaite juste investir",
                    icon: "icon-cloud-upload",
                    question: "",
                    questionComment: "Il s'agit d'un investissement sur le long terme, sans aucun objectif spécifique",
                },
                {
                    code: "retirement",
                    label: "Retraîte",
                    tooltip: "Je souhaite préparer ma retraîte",
                    icon: "icon-wallet",
                    question: "Dans combien d'années prévoyez-vous de partir en retraite ?",
                    questionComment: ""
                },
                {
                    code: "home",
                    label: "Maison",
                    tooltip: "Je souhaite économiser pour une maison ou un appartement",
                    icon: "icon-home",
                    question: "Dans combien d'années aurez-vous besoin de l'argent ?",
                    questionComment: ""
                },
                {
                    code: "child",
                    label: "Enfants",
                    tooltip: "Je souhaite mettre de l'argent de côté pour mes enfants",
                    icon: "icon-graduation",
                    question: "Dans combien d'années aurez-vous besoin de l'argent ?",
                    questionComment: ""
                },
                {
                    code: "rainy-day",
                    label: "Coups durs",
                    tooltip: "Je souhaite mettre de l'argent de côté pour des situations inattendues",
                    icon: "icon-umbrella",
                    question: "Dans combien d'années aurez-vous besoin de l'argent ?",
                    questionComment: ""
                },
                {
                    code: "big-spend",
                    label: "Grandes occasions",
                    tooltip: "Je souhaite économiser pour les grandes occasions (mariage, voiture, vacances, etc.)",
                    icon: "icon-plane",
                    question: "Dans combien d'années aurez-vous besoin de l'argent ?",
                    questionComment: ""
                },
                {
                    code: "other",
                    label: "Autre",
                    tooltip: "Je souhaite économiser pour toutes autres raisons",
                    icon: "icon-handbag",
                    question: "Dans combien d'années aurez-vous besoin de l'argent ?",
                    questionComment: ""
                },
            ],
            risks = [
                {
                    level: "low",
                    label: 'Risque Faible',
                    tooltip: "Je ne veux pas prendre de risque sur mon capital investi"
                },
                {
                    level: "medium",
                    label: 'Risque Moyen',
                    tooltip: "J'accepte de prendre des risques modérés sur tout ou partie de mon capital investi"
                },
                {
                    level: "high",
                    label: 'Risque Elevé',
                    tooltip: "J'accepte de prendre des risques significatifs sur tout ou partie de mon capital investi"
                }
            ],
            structure = {
                "fields": {
                    id: "integer",
                    "name": "string",
                    "goal": "string",
                    "when": "integer",
                    "amountMonthly": "float",
                    "risk": "string"
                },
                "accepts": {
                    "goal": ["just-invest", "retirement", "home", "child", "rainy-day", "big-spend", "other"],
                    "risk": ["low", "medium", "high"]
                },
                "requirements": {
                    "just-invest": {
                        "retirement": ["amountMonthly", "risk"]
                    },
                    "goal": {
                        "retirement": ["when", "amountMonthly", "risk"]
                    },
                    "home": {
                        "retirement": ["when", "amountMonthly", "risk"]
                    },
                    "child": {
                        "retirement": ["when", "amountMonthly", "risk"]
                    },
                    "rainy-day": {
                        "retirement": ["amountMonthly", "risk"]
                    },
                    "big-spend": {
                        "retirement": ["when", "amountMonthly", "risk"]
                    },
                    "other": {
                        "retirement": ["when", "amountMonthly", "risk"]
                    }
                }
            };

        var Keywords = {
            get: function(id) {
                for (var i in this.list) {
                    if (id == this.list[i].id) {
                        return this.list[i];
                    }
                }
                return null;
            },

            list: [
                {
                    id: "africa",
                    type: "region",
                    name: "Afrique"
                },
                {
                    id: "europe",
                    type: "region",
                    name: "Europe"
                },
                {
                    id: "asia-pacific",
                    type: "region",
                    name: "Asie Pacifique"
                },
                {
                    id: "north-america",
                    type: "region",
                    name: "Amérique du Nord"
                },
                {
                    id: "latin-america",
                    type: "region",
                    name: "Amérique Latine"
                },
                {
                    id: "fr",
                    type: "country",
                    name: "France"
                },
                {
                    id: "us",
                    type: "country",
                    name: "USA"
                },
                {
                    id: "be",
                    type: "country",
                    name: "Belgique"
                },
                {
                    id: "jp",
                    type: "country",
                    name: "Japon"
                },
                {
                  id: "it",
                  type: "country",
                  name: "Italie"
                },
                {
                  id: "ch",
                  type: "country",
                  name: "Chine"
                },
                {
                  id: "jp",
                  type: "country",
                  name: "Japon"
                },
                {
                  id: "es",
                  type: "country",
                  name: "Espagne"
                },
                {
                  id: "de",
                  type: "country",
                  name: "Allemagne"
                },
                {
                  id: "ru",
                  type: "country",
                  name: "Russie"
                },
                {
                  id: "tr",
                  type: "country",
                  name: "Turquie"
                },
                {
                  id: "hk",
                  type: "country",
                  name: "Hong-Kong"
                },
                {
                  id: "kr",
                  type: "country",
                  name: "Corée"
                },
                {
                  id: "in",
                  type: "country",
                  name: "Inde"
                },
                {
                  id: "gr",
                  type: "country",
                  name: "Grèce"
                },
                {
                  id: "br",
                  type: "country",
                  name: "Brézil"
                },
                {
                  id: "tw",
                  type: "country",
                  name: "Taïwan"
                },
                {
                    id: "eurozone",
                    type: "region",
                    name: "Eurozone"
                },
                {
                    id: "eu",
                    type: "region",
                    name: "Europe"
                },
                {
                    id: "water",
                    type: "thematic",
                    name: "Eau"
                },
                {
                    id: "energy",
                    type: "thematic",
                    name: "Energie"
                },
                {
                    id: "financial",
                    type: "sector",
                    name: "Finance"
                },
                {
                    id: "biens",
                    type: "sector",
                    name: "Biens de consommation"
                },
                {
                    id: "industry",
                    type: "sector",
                    name: "Industrie"
                },
                {
                    id: "health",
                    type: "sector",
                    name: "Santé"
                },
                {
                    id: "collectivity",
                    type: "sector",
                    name: "Services aux collectivités"
                },
                {
                    id: "services",
                    type: "sector",
                    name: "Services"
                },
                {
                    id: "technology",
                    type: "sector",
                    name: "Technologie de l'information"
                },
                {
                    id: "material",
                    type: "sector",
                    name: "Matérieux"
                },
                {
                    id: "services",
                    type: "sector",
                    name: "Services"
                },
                {
                    id: "immobilier",
                    type: "sector",
                    name: "Immobilier"
                },
                {
                    id: "other",
                    type: "sector",
                    name: "Autres"
                },
                {
                    id: "world",
                    type: "broad",
                    name: "World"
                },
                {
                    id: "oil",
                    type: "news",
                    name: "Pétrole"
                },
                {
                    id: "matieres-premieres",
                    type: "news",
                    name: "Matières premières"
                },
                {
                    id: "pme",
                    type: "theme",
                    name: "PME"
                },
                {
                    id: "grande-entreprises",
                    type: "theme",
                    name: "Grandes entreprises"
                },
                {
                    id: "eau",
                    type: "theme",
                    name: "Eau"
                },
                {
                    id: "developpement-durable",
                    type: "theme",
                    name: "Développement durable"
                },
            ]
        };

        var Matrix = {
            convert: {
                strategy: function(strategy) {
                    var m = [];

                    for (var i in Keywords.list) {
                        m.push(strategy[Keywords.list[i].id] || 0);
                    }

                    return m;
                },
                catalog: function(etfs) {
                    var m = new Array(etfs.length);

                    for (var i in etfs) {
                        m[i] = new Array(Keywords.list.length);

                        for (var j in Keywords.list) {
                            var etf = etfs[i];

                            m[i][j] = 0;

                            for (var k in etf.keywords) {
                                var keyword = etf.keywords[k];

                                if (keyword.id == Keywords.list[j].id) {
                                    m[i][j] = keyword.weight;
                                    break;
                                }
                            }
                        }
                    }
                    return m;
                }
            },
            transpose: {
                catalog: function(matrix, etfs) {
                    var result = [];

                    for (var i in matrix) {
                        if (matrix[i]) {
                            result.push(etfs[i]);
                        }
                    }

                    return result;
                }
            },
            multiply: function(catalog, strategy) {
                var result = new Array(catalog.length);

                for (var i in catalog) {
                    result[i] = 0;

                    for (var j in strategy) {
                        result[i] += catalog[i][j] * strategy[j];
                    }
                }

                return result;
            }
        };

        var Strategy = function(keywords) {
            keywords = keywords || {};

            var changed = false;

            if (keywords instanceof Array) { // Convert Array to Object structure
                var tmp = {};

                for (var i in keywords) {
                    tmp[keywords[i].id] = {
                        weight: keywords[i].weight,
                        operator: 'OR'
                    };
                }
                keywords = tmp;

            } else if (typeof keywords == 'object' && keywords !== null) {
                var tmp = {};

                for (var keyword in keywords) {
                    tmp[keyword] = {
                        weight: keywords[keyword],
                        operator: 'OR'
                    };
                }

                keywords = tmp;
            }

            return {
                changed: function() {
                    return changed;
                },

                get: function() {
                    return keywords;
                },

                compare: function(strategy) {
                    for (var id in keywords) {
                        if (!strategy.keywords.exists(id)) {
                            return false;
                        }
                    }
                    return true;
                },

                keywords: {
                    add: function(id, weight, operator) {
                        if (keywords[id]) {
                            keywords[id].weight = weight;
                            changed = true;
                            return;
                        }

                        keywords[id] = {
                            weight: weight || 1,
                            operator: (operator || 'OR').toUpperCase()
                        };

                        changed = true;
                    },

                    exists: function(id) {
                        return typeof keywords[id] != 'undefined';
                    },

                    get: function() {
                        var output = [];

                        for (var key in keywords) {
                            output.push(key);
                        }

                        return output;
                    },

                    length: function() {
                        var i = 0;

                        for (var key in keywords) {
                            i++;
                        }

                        return i;
                    },

                    clear: function() {
                        keywords = {};
                        changed = true;
                    },

                    remove: function(id) {
                        delete keywords[id];
                        changed = true;
                    }
                },

                cross: function(etfs) {
                    var catalog = Matrix.convert.catalog(etfs);
                    var strategy = {
                        AND: {},
                        OR: {},
                    };
                    var count = {
                        AND: 0,
                        OR: 0,
                    };
                    var result = [];

                    for (var id in keywords) {
                        strategy[keywords[id].operator][id] = keywords[id].weight;
                        count[keywords[id].operator]++;
                    }

                    if (count.AND) {
                        result = Matrix.multiply(catalog, Matrix.convert.strategy(strategy.AND));

                        if (count.OR) {
                            catalog = Matrix.convert.catalog(Matrix.transpose.catalog(result, etfs));
                            result = Matrix.multiply(catalog, Matrix.convert.strategy(strategy.OR));
                        }

                        changed = false;
                    } else if (count.OR) {
                        result = Matrix.multiply(catalog, Matrix.convert.strategy(strategy.OR));
                        changed = false;
                    }

                    console.log('result: ', result)

                    return Matrix.transpose.catalog(result, etfs);
                },

                /**
                 * Get the portfolio ETFs list based on the current strategy
                 */
                etfs: function(done) {
                    $EtfsFactory.loadAll((function(self) {
                        return function(list) {
                            done(self.cross(list));
                        };
                    })(this));
                }
            };
        };

        var PortfolioPrototype = {
            cache: {},
            init: function(clientId, isClone, done) {
                var clientIdCache = clientId;
                var ready = false;

                if (isClone) {
                    clientIdCache = 'clone-' + clientId;
                }

                this.cache[clientIdCache] = {
                    desc: {},
                    order: {},
                    ready: function() { return ready; },
                    valo: {},
                    dataValo: [],
                    value: 0.0,
                    strategy: {},
                    cache: {
                        trades: [],
                        tradesByDate: null, // {}
                    },
                    prototype: {}
                };

                // Load the portfolio's description
                $http.get(WS_URL + '/client/portfolio/' + clientId)
                    .success(function(portfolio) {
                        var currency = typeof portfolio['dividends']['EUR'] != 'undefined' ? 'EUR' : 'USD';
                        var isins = [];

                        for (var isin in portfolio.etfs) {
                            isins.push(isin);
                        }

                        PortfolioPrototype.cache[clientIdCache].desc = {
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

                        PortfolioPrototype.cache[clientIdCache].strategy = new Strategy(portfolio.strategy || []);

                        ready = PortfolioPrototype.cache[clientIdCache].dataValo.length > 0;

                        if (ready && typeof done == 'function') {
                            done();
                        }
                    })
                    .error(function(data, status, headers, config) {
                        throw new Error("Failed to load portfolio of ClientID " + clientId);
                    });

                // Load the portfolio's value
                $http.get(WS_URL + '/client/valo/' + clientId)
                    .success(function(valo) {
                        var data_valo = [];

                        for (var date in valo) {
                            data_valo.push([new Date(date).getTime(), valo[date]]);
                        }

                        data_valo.sort(function (a, b) {
                            return a[0] - b[0];
                        });

                        PortfolioPrototype.cache[clientIdCache].valo = valo;
                        PortfolioPrototype.cache[clientIdCache].dataValo = data_valo;
                        PortfolioPrototype.cache[clientIdCache].value = data_valo.length
                                                                      ? data_valo[data_valo.length - 1][1]
                                                                      : 0;

                        ready = typeof PortfolioPrototype.cache[clientIdCache].strategy.keywords != 'undefined';

                        if (ready && typeof done == 'function') {
                            done();
                        }
                    })
                    .error(function(data, status, headers, config) {
                        throw new Error("Failed to load portfolio valo of ClientID " + clientId);
                    });

                return PortfolioPrototype.cache[clientIdCache];
            }
        };

        var gains_by_etf = function(etf, trades) {
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
        };

        return {
            Strategy: Strategy,
            Keywords: Keywords,
            
            Portfolio: function(clientId, clone, done) {
                var self = PortfolioPrototype.init(clientId, clone || false, done);

                self.prototype.trades = function(done) {
                    if (self.cache.trades.length) {
                        return done(false, self.cache.trades);
                    }
                    
                    $http.get(WS_URL + '/client/trades/' + clientId)
                        .success(function(trades) {
                            self.cache.trades = trades;
                            
                            done(false, trades);
                        })
                        .error(function(data, status, headers, config) {
                            var err = new Error("Failed to load portfolio trades of ClientID " + clientId);
                            
                            err.status = status;
                            err.headers = headers;
                            
                            cb(err, null);
                            
                            console.error(err.message);
                        });
                };
                
                // all the TYPE STOCKIN and CASHIN in the trades according to the value's data in the wallet
                self.prototype.tradesByDate = function(done) {
                    if (self.cache.tradesByDate) {
                        return done(false, self.cache.tradesByDate);
                    }

                    self.prototype.trades(function(err, trades) {
                        if (err) {
                            return done(err, null);
                        }

                        var somme_trades = 0;
                        var trades_by_date = {};

                        for (var x in self.dataValo) {
                            for (var i in trades) {
                                if ((trades[i].type == 'CASHIN' || trades[i].type == 'STOCKIN') && self.dataValo[x][0] == new Date(trades[i].date).getTime()) {
                                    somme_trades += trades[i].cash;
                                }
                            }
                            trades_by_date[new Date(self.dataValo[x][0])] = somme_trades;
                        }

                        self.cache.tradesByDate = trades_by_date;

                        done(false, trades_by_date);
                    });
                };
                
                self.prototype.etfs = {
                    list: function(done) {
                        $EtfsFactory.load(self.desc.etfs, function(etfs) {
                            self.prototype.trades(function(err, trades) {
                                if (err) {
                                    return done(err, null);
                                }
                                
                                for (var i = 0; i < etfs.length; i++) {
                                    etfs[i].gains = gains_by_etf(etfs[i], trades);
                                    etfs[i].quantity = etfs[i].quantity || 1;
                                }
                                
                                done(false, etfs);
                            });
                        });
                    },
                    value: function(done) {
                        this.list(function(err, etfs) {
                            if (err) {
                                return done(err, null);
                            }
                            
                            var value = 0;
                            
                            for (var i = 0; i < etfs.length; i++) {
                                value += etfs[i].price * etfs[i].quantity;
                            }
                            
                            self.etfsValue = value;
                            
                            done(false, self.etfsValue);
                        });
                    },
                    gains: function(done) {
                        if (self.gains) {
                            return done(false, self.gains);
                        }
                        
                        this.list(function(err, etfs) {
                            if (err) {
                                return done(err, null);
                            }
                            
                            var gains = 0;
                            
                            for (var i = 0; i < etfs.length; i++) {
                                gains += etfs[i].gains;
                            }
                            
                            self.gains = gains;
                            
                            done(false, gains);
                        });
                    },
                };

                self.prototype.persist = function(portfolio) {
                    self.desc = angular.copy(portfolio.desc);
                    self.order.value = portfolio.value;
                    self.order.strategy = angular.copy(portfolio.strategy);
                };
                
                return self;
            },

            /**
             * A portfolio prototype
             */
            prototype: {
                goal: function(goal) {
                    for (var i = 0; i < goals.length; i++) {
                        if (goal == goals[i].code) {
                            return goals[i];
                        }
                    }
                    throw new Error("Unknow goal " + goal);
                },

                risk: function(level) {
                    for (var i = 0; i < risks.length; i++) {
                        if (level == risks[i].level) {
                            return risks[i];
                        }
                    }
                    throw new Error("Unknow level risk " + level);
                },

                goals: function() {
                    return goals;
                },

                risks: function() {
                    return risks;
                }
            },
        };
    });