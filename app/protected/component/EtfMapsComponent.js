angular.module('MetronicApp')
    .controller('EtfMapsController', ['$EtfsFactory', '$scope', '$element', '$attrs', function($EtfsFactory, $scope, $element, $attrs) {
        $element.render = function(etfs) {
            var mapData = Highcharts.geojson(Highcharts.maps['custom/world']);

            $element.highcharts('Map', {
                exporting: {
                    enabled: false
                },

                legend: {
                    enabled: false
                },

                plotOptions: {
                    series: {
                        nullColor: $attrs.nullColor || 'rgba(107, 120, 139, 0.1)',
                        borderColor: $attrs.borderColor || 'rgba(107, 120, 139, 0.01)',
                        color: $attrs.color || 'rgba(255, 174, 0, 0.96)',
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
                    minSize: 4,
                    maxSize: '12%',
                }]
            });
        }

        if (!$attrs.lazy || $attrs.filter) {
            $EtfsFactory.load($attrs.filter, $element.render);
        }

        function parse(etfs) {
            var sum = 0
              , percents = {}
              , percents_by_country = {}
              , series = [];

            // Compute all etfs
            for (var i = 0; i < etfs.length; i++) {
                sum += etfs[i].quantity;
            }

            // Compute the percents of each etf
            for (var i = 0; i < etfs.length; i++) {
                percents[etfs[i].isin] = etfs[i].quantity * 100 / sum;
            }

            // Compute the percents by country
            for (var i = 0; i < etfs.length; i++) {
                var etf = etfs[i];

                // for each country of an etf
                for (var j = 0; j < etf.countries.length; j++) {
                    for (var country in etf.countries[j]) {
                        if (country === 'UK') {
                            country = 'GB';
                        }

                        if (typeof percents_by_country[country] == 'undefined') {
                            percents_by_country[country] = 0;
                        }

                        percents_by_country[country] += parseFloat(percents[etf.isin]);
                    }
                }
            }

            // structure data
            for (var country in percents_by_country) {
                series.push({
                    country: country,
                    value: percents_by_country[country],
                    p: percents_by_country[country],
                });
            }

            return series;
        }

    }])
    .directive("ngEtfMaps", function($EtfsFactory) {
        return {
            controller: "EtfMapsController",
            link: function($scope, $element, $attrs) {


                $scope.$watch(function() {
                    return $element.attr('data-filter');
                }, function(newFilter) {
                    if (newFilter) {
                        $EtfsFactory.load(newFilter, $element.render);
                    }
                });
            }
        };
    });