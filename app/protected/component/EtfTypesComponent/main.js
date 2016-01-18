angular.module('MetronicApp')
    .controller('EtfTypesController', function($ocLazyLoad, $EtfsFactory, $scope, $element, $attrs) {
        $ocLazyLoad.load({
            insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files

            files: [
                '/protected/component/EtfTypesComponent/style.css'
            ]
        });


        $element.render = function(etfs) {

            var data = prase(etfs);

            $scope.models = data;

        }

        var prase = function (etfs) {
            var sum = 0
                , percents = {}
                , series = [];

            // Compute the percents by type
            for (var i = 0; i < etfs.length; i++) {
                var etf = etfs[i];

                if (typeof percents[etf.type] == 'undefined') {
                    percents[etf.type] = 0;
                }

                percents[etf.type] += etf.quantity;
                sum += etf.quantity;
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
            return $scope.model;
        }, function(filter) {
            $EtfsFactory.load(filter, $element.render, false);
        });

    })


    .directive("typeProgress", function($EtfsFactory) {
        return {
            controller: "EtfTypesController",
            restrict: 'E',
            scope: {
                model: '=model'
            },
            templateUrl: "/protected/component/EtfTypesComponent/template.html"
        };
    });