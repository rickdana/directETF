angular.module('MetronicApp')
    .factory('$OrdersFactory', function() {
        var etfs = {};
        var quantities = {};
        var locked = false;

        return {
            lock: function() {
                locked = true;
            },
            unlock: function() {
                locked = false;
            },
            set: function(etf, quantity) {
                if (locked) {
                    return;
                }
                if (!etfs[etf.isin]) {
                    etfs[etf.isin] = etf;
                    quantities[etf.isin] = etf.quantity;

                    return console.log("-> %s(quantity: %s, price: %s) was added in the selection list", etf.isin, etf.quantity, etf.price);
                }

                if (typeof quantity != 'undefined') {
                    quantities[etf.isin] = parseInt(quantity);
                } else {
                    quantity = quantities[etf.isin];
                }

                console.log("-- Set %s(quantity: %s, price: %s)", etf.isin, quantity, etf.price);
            },
            get: function(isin) {
                if (isin) {
                    if (etfs[isin]) {
                        return etfs[isin];
                    }
                    return null;
                }

                var array = [];

                for (var isin in etfs) {
                    if (etfs[isin] && quantities[isin]) {
                        etfs[isin].quantity = quantities[isin];
                        array.push(etfs[isin]);
                    }
                }

                return array;
            },
            length: function() {
                var i = 0;

                for (var isin in etfs) {
                    if (quantities[isin]) {
                        i++;
                    }
                }

                return i;
            },
            cash: function() {
                var cash = 0;

                for (var isin in quantities) {
                    cash += quantities[isin] * etfs[isin].price;
                }

                return cash;
            },
            distribution: function($etfs, limit) {
                if (!$etfs || !$etfs.length) {
                    return;
                }

                var initial_cash = 0;
                var percents = {};
                var ratio = limit / initial_cash;

                for (var i in $etfs) {
                    initial_cash += $etfs[i].price;
                }

                for (var i in $etfs) {
                    percents[$etfs[i].isin] = $etfs[i].price / initial_cash;
                }

                this.unlock();

                for (var i in $etfs) {
                    var isin = $etfs[i].isin;
                    var quantity = Math.floor(percents[isin] * limit / etfs[isin].price);

                    $etfs[i].quantity = quantity;
                    this.set($etfs[i], quantity);
                }

                var diff = limit - this.cash();

                while (diff > 0) {
                    for (var i = 0, j = 0; i < $etfs.length; i++) {
                        if ($etfs[i].price <= diff) {
                            this.set($etfs[i], ++$etfs[i].quantity);
                            diff -= $etfs[i].price;

                            if (diff <= 0) {
                                j = i;
                                break;
                            }
                        } else {
                            j++;
                        }
                    }

                    if (i == j) {
                        break;
                    }
                }

                this.lock();
            }
        };
    })
    .controller('QuestionnaireController', function($OrdersFactory, $scope, $http, $attrs) {
        if ($attrs.json) {
            $http.get($attrs.json)
                .then(function(questionnaireFile) {
                    $scope.$OrdersFactory = $OrdersFactory;

                    $scope.filters = {
                        current: {
                            category: questionnaireFile.data.start,
                            value: '',
                            question: '',
                            answer: '',
                        },
                        history: {
                            entries: [],
                            remove: function(array, from, to) {
                                var rest = array.slice((to || from) + 1 || array.length);
                                array.length = from < 0 ? array.length + from : from;
                                array.push.apply(array, rest)
                                return array.push.apply(array, rest);
                            }
                        },
                        exec: function(history, q, a) {
                            if (a.goto != questionnaireFile.data.end) {
                                return;
                            }

                            var query = [];

                            for(var i in history) {
                                query.push(history[i][1].id);
                            }

                            console.log(query.join('-'));
                        },
                        entries: questionnaireFile.data.questionnaire
                    };
                });
        }
    })
    .directive('questionnaire', function() {
        return {
            controller: "QuestionnaireController",
            templateUrl: "/protected/component/Questionnaire/template.html"
        };
    });