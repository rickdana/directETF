angular.module('MetronicApp')
    .factory('$PortfolioFactory', function($http) {
        var models = {}
          , goals = [];

        function validGoal(goal, cb) {
            for (var i = 0; i < goals.length; i++) {
                if (goals[i].code == goal) {
                    break;
                }
            }

            if (i == goal) {
                var err = new Error('Unknow goal ' + goal);

                err.status = null;
                err.headers = null;

                cb(err);

                return console.error(err.message);
            }

            cb(false)
        }

        function loadModel(goal, amountMonthly, riskLevel, cb) {
            var key = goal + amountMonthly + riskLevel;

            if (models[key]) {
                return cb(false, models[key]);
            }

            $http.get(WS_URL + '/portfolio/model/' + riskLevel)
                .success(function (model, status, headers, config) {
                    models[key] = model;
                    cb(false, model);
                })
                .error(function(data, status, headers, config) {
                    var err = new Error("Failed to get model of the risk " + riskLevel);

                    err.status = status;
                    err.headers = headers;

                    cb(err, null);

                    console.error(err.message);
                });
        }

        // Load portfolio goals
        function loadGoals(cb) {
            $http.get(WS_URL + '/portfolio/goals')
                .success(function (portfolio_goals, status, headers, config) {
                    goals = portfolio_goals;
                    cb(false, portfolio_goals);
                })
                .error(function(data, status, headers, config) {
                    var err = new Error("Failed to get the portfolio goals!");

                    err.status = status;
                    err.headers = headers;

                    cb(err, null);

                    console.error(err.message);
                });
        }

        return {
            model: function(goal, amountMonthly, riskLevel, cb) {
                if (typeof cb != 'function') {
                    throw new Error('cb must be a callback function!');
                }

                if (goals.length == 0) {
                    this.goals(function(err, goals) {
                        validGoal(goal, function(err) {
                            if (err) {
                                return cb(err, null);
                            }
                            loadModel(goal, amountMonthly, riskLevel, cb);
                        });
                    });
                } else {
                    loadModel(goal, amountMonthly, riskLevel, cb);
                }
            },
            goals: function(cb) {
                if (typeof cb != 'function') {
                   throw new Error('cb must be a callback function!');
                }

                if (goals.length) {
                   return cb(false, goals);
                }
                loadGoals(cb);
            },
        };
    });