angular.module('MetronicApp')
    .factory('$PortfolioFactory', function($http) {
        var models = {};
    
        function load(riskLevel, cb) {
            $http.get(WS_URL + '/portfolio/model/' + riskLevel)
                .success(function (portfolio, status, headers, config) {
                    models[riskLevel] = portfolio;
                    cb(portfolio);
                })
                .error(function(data, status, headers, config) {
                    console.error("Failed to get model of the risk %s", riskLevel);
                });
        }

        return {
            get: function load(riskLevel, cb) {
                if (typeof cb != 'function') {
                    throw new Error('cb must be a callback function!');
                }

                riskLevel = riskLevel || 'low';

                if (models[riskLevel]) {
                    return cb(models[riskLevel]);
                }

                load(riskLevel, cb);
            }
        };
    });