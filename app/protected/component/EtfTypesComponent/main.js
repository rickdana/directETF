angular.module('DirectETF')
    .controller('EtfTypesController', function($ocLazyLoad, $EtfsFactory, $rootScope, $scope, $attrs) {
        $ocLazyLoad.load({
            insertBefore: '#ng_load_plugins_before',

            files: [
                '/protected/component/EtfTypesComponent/style.css'
            ]
        });

        var load = function(etfs) {
            var sum = 0
                , percents = {}
                , series = [];

            // Compute the percents by type
            for (var i = 0; i < etfs.length; i++) {
                var etf = etfs[i];

                if (typeof percents[etf.type] == 'undefined') {
                    percents[etf.type] = 0;
                }

                percents[etf.type] += etf.quantity || 1;
                sum += etf.quantity || 1;
            }

            // Build the serie
            var i = 0;
            var colors = ['#3fa1aa', '#6fc7cf', ' #a1e4ea'];

            for (var type in percents) {
                percents[type] = percents[type] * 100 / sum;

                series.push({
                    name: type,
                    y: Math.round(parseFloat(percents[type])) + '%',
                    color: colors[i++]
                });
            }

            return series;
        };

        $scope.$watch(function() {
            return $scope.portfolio && $scope.portfolio.strategy && $scope.portfolio.isins.length;
        }, function() {
            if (!$scope.portfolio) {
                return;
            }

            if ($scope.portfolio.strategy.compare($rootScope.client.portfolio.strategy)) {
                $EtfsFactory.load($rootScope.client.portfolio.etfs, function(etfs) {
                    $scope.types = load(etfs);
                });
            } else {
                $scope.portfolio.strategy.etfs(function(etfs) {
                    $scope.types = load(etfs);
                });
            }
        });
    })
    .directive("typeProgress", function($EtfsFactory) {
        return {
            controller: "EtfTypesController",
            restrict: 'E',
            scope: {
                portfolio: '=portfolio'
            },
            templateUrl: "/protected/component/EtfTypesComponent/template.html"
        };
    });