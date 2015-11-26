angular.module('MetronicApp')
    .factory('$PortfolioFactory', function($http) {
        var models = {};

        function key(goal, amountMontly, riskLevel) {
            return goal + amountMontly + riskLevel;
        }

        function load(goal, amountMontly, riskLevel, cb) {
            $http.get(WS_URL + '/portfolio/model/' + riskLevel)
                .success(function (portfolio, status, headers, config) {
                    models[key(goal, amountMontly, riskLevel)] = portfolio;
                    cb(portfolio);
                })
                .error(function(data, status, headers, config) {
                    console.error("Failed to get model of the risk %s", riskLevel);
                });
        }

        return {
            model: function load(goal, amountMontly, riskLevel, cb) {
                if (typeof cb != 'function') {
                    throw new Error('cb must be a callback function!');
                }

                riskLevel = riskLevel || 'low';

                var key = key(goal, amountMontly, riskLevel);

                if (models[key]) {
                    return cb(models[key]);
                }

                load(goal, amountMontly, riskLevel, cb);
            }
        };
    });