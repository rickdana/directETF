angular.module('MetronicApp')
    .controller('EtfMapsController', function($EtfsFactory, $rootScope, $scope, $element, $attrs) {
        $element.css({
            display: 'block'
        });

        var render = function(etfs) {
            var mapData = Highcharts.geojson(Highcharts.maps['custom/world']);

            $element.highcharts('Map', {
                exporting: {
                    enabled: false,
                },

                legend: {
                    enabled: false
                },

                plotOptions: {
                    series: {
                        nullColor: $attrs.nullColor || 'rgba(107, 120, 139, 0.1)',
                        borderColor: $attrs.borderColor || 'transparent',
                        color: $attrs.color || 'rgba(98, 87, 255, 0.66)',
                    }
                },
                chart: {
                    // Edit chart spacing
                    spacingBottom: 0,
                    spacingTop: 0,
                    spacingLeft: 0,
                    spacingRight: 0,

                    marginTop: 0,
                    marginRight: 0,
                    marginBottom: 0,
                    marginLeft: 0,

                    // Explicitly tell the width and height of a chart
                    width: $attrs.width || null,
                    height: $attrs.height || null
                },

                mapNavigation: {
                    enabled: true,
                    buttonOptions: {
                        verticalAlign: 'bottom',
                        style: {
                            position: 'absolute',
                            bottom: '25px'
                        },
                    },
                    enableMouseWheelZoom: false,
                },

                tooltip: {
                    useHTML: true,
                    formatter: function () {
                        if (this.point.value) {
                            return this.point.name + ' : ' + this.point.p.toFixed(2) + '%';
                        }
                    }
                },

                series: [{
                    mapData: mapData,
                    enableMouseTracking: false
                }, {
                    mapData: mapData,
                    joinBy: ['iso-a2', 'country'],
                    data: parse(etfs),
                    //minSize: 4,
                    //maxSize: '12%',
                }]
            });
        }

        var parse = function(etfs) {
            var sum = {}
              , percents = {}
              , series = [];

            // Compute the percents by country
            for (var i = 0; i < etfs.length; i++) {
                var etf = etfs[i];

                // for each country of an etf
                for (var j = 0; j < etf.countries.length; j++) {
                    for (var country in etf.countries[j]) {
                        if (typeof percents[country] == 'undefined') {
                            percents[country] = 0;
                            sum[country] = 0;
                        }

                        percents[country] += etf.countries[j][country];
                    }
                }
            }

            for (var country in percents) {
                percents[country] = percents[country] / etfs.length;

                series.push({
                    country: country === 'UK' ? 'GB' : country,
                    value: percents[country],
                    p: percents[country],
                });
            }

            return series;
        }

        $scope.$watch(function() {
            return $scope.model;
        }, function(filter) {
            if (typeof filter == 'undefined' || filter.length == 0) {
                if ($attrs.demo) {
                    filter = $rootScope.client.portfolio.etfs;
                } else {
                    return;
                }
            }

            $EtfsFactory.load(filter, render);
        });
    })
    .directive("map", function($EtfsFactory) {
        return {
            restrict: 'E',
            scope: {
                model: '=model'
            },
            controller: "EtfMapsController"
        };
    });