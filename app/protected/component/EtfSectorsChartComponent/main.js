angular.module('MetronicApp')
    .controller('EtfSectorsChartController', ['$ocLazyLoad', '$EtfsFactory', '$scope', '$element', '$attrs', function($ocLazyLoad, $EtfsFactory, $scope, $element, $attrs) {
        $ocLazyLoad.load({
            insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files

            files: [
                '/protected/component/EtfSectorsChartComponent/style.css'
            ]
        });

        var sector_info_box = $element.find('.sectors-overview-box');

        $element.$EtfsFactory = $EtfsFactory;
        $element.render = function(etfs) {
            $element.find('.etf-sectors-pie-chart-wrapper').highcharts({
        //            colors: ['rgba(0, 166, 90,.3)', 'rgba(0, 166, 90,.8)', 'rgba(0, 166, 90,.7)', 'rgba(0, 166, 90,.5)'],

                mapNavigation: {
                   enabled: false
                },

                chart: {
                    type: 'pie',
                    plotBackgroundColor: null,
                    plotBorderWidth: 0,
                    plotShadow: false,
                    height: $attrs.height || null,
                    width: $attrs.width || null,
                    style: {
                        top: '0px',
        //                    left: '-30px'
                        'margin-bottom': '0px'
                    },
                    options3d: {
                        enabled: true,
                        alpha: 45,
                        beta: 0
                    }
                },
                tooltip: {
                    pointFormat: ' <b>{point.percentage:.2f}%</b>'
                },

                plotOptions: {
                    pie: {
                        ignoreHiddenPoint: false,
                        allowPointSelect: true,
                        cursor: 'pointer',
                        depth: 35,
                        dataLabels: {
                            enabled: $attrs.enableDataLabels === 'true' || false,
                            format: '{point.name}'
                        },
                        showInLegend: $attrs.showInLegend === 'true' || false,
                    },
                    series: {
                        shadow: true
                    },
                },

                series: [{
                    type: 'pie',
                    data: parse(etfs),
                    colorByPoint: true,
                    point: {
                        events: {
                            select: function (e) {
                                this.slice(false);
                            },
                        }
                    },
                    options3d: {
                        enabled: true,
                        alpha: 45,
                        beta: 0
                    },
                    events: {
                        click: function (e) {
                            current_pie = e;

                            var color = e.point.color;

                            if (typeof color == 'object') {
                                color = color.stops[1][1].match(/\d+,\s?\d+,\s?\d+/)[0];
                                color = 'rgba(' + color + ', .8)';
                            }

                            if (sector_info_box.attr('data-current') == e.point.name) {
                                sector_info_box.attr('data-current', '');
                                sector_info_box.hide('slow');
                            } else {
                                sector_info_box.show('slow');
                                sector_info_box.attr('data-current', e.point.name);
                            }

                            sector_info_box.find('.info-box-title').text(e.point.name + " " + e.point.percentage.toFixed(1) + "%");

                            sector_info_box.find('.info-box-icon, .btn')
                                .css('color', 'rgba(255,255,255,.8)')
                                .css('background-color', color);
                        }
                    }
                }],

                colorAxis: null,

                legend: {
                    enabled: true,
                    labelFormat: '{name} ({percentage:.1f}%)',
                    maxHeight: 81,
                    navigation: {
                        activeColor: '#3E576F',
                        animation: true,
                        arrowSize: 9,
                        inactiveColor: '#CCC',
                        style: {
                            fontWeight: 'bold',
                            color: '#333',
                            fontSize: '11px',
                        },
                    },
                },
            });

            sector_info_box.css('display', 'block')
                           .hide()
                           .find('.btn').on('click', function () {
                                sector_info_box.hide('slow');
                                sector_info_box.attr('data-current', '');
                                current_pie.point.slice(false);
                           });

        };

        if (!$attrs.lazy) {
            $element.$EtfsFactory.load($attrs.filter, $element.render);
        }

        function parse(etfs) {
            var sum = 0
              , percents = {}
              , percents_by_sector = {}
              , series = [];

            // Compute all etfs
            for (var i = 0; i < etfs.length; i++) {
                sum += etfs[i].quantity;
            }

            // Compute the percents of each etf
            for (var i = 0; i < etfs.length; i++) {
                percents[etfs[i].isin] = etfs[i].quantity * 100 / sum;
            }

            // Compute the percents by sector
            for (var i = 0; i < etfs.length; i++) {
                var etf = etfs[i];

                // for each sector of the etf
                for (var j = 0; j < etf.sectors.length; j++) {
                    for (var sector in etf.sectors[j]) {
                        if (typeof percents_by_sector[sector] == 'undefined') {
                            percents_by_sector[sector] = 0;
                        }

                        percents_by_sector[sector] += parseFloat(percents[etf.isin]);
                    }
                }
            }

            // Build the serie
            for (var s in percents_by_sector) {
                series.push({
                    name: s,
                    y: parseFloat(percents_by_sector[s])
                });
            }

            //series[0].sliced = true;
            //series[0].selected = true;
            series.sort(function (a, b) {
                return b.y - a.y
            });

            for (var i = 3; i < series.length; i++) {
                series[i].visible = false;
            }

            return series;
        }

    }])
    .directive("ngEtfSectorsChart", function() {
        return {
            controller: "EtfSectorsChartController",
            templateUrl: "/protected/component/EtfSectorsChartComponent/template.html",
            link: function($scope, $element, $attrs) {
                // Trigger when number of children changes,
                // including by directives like ng-repeat
                $scope.$watch(function() {
                    return $element.attr('filter');
                }, function() {
                    // Wait for templates to render
                    $scope.$evalAsync(function() {
                        // Finally, directives are evaluated
                        // and templates are renderer here
                        if ($element.attr('filter')) {
                            $element.$EtfsFactory.load($element.attr('filter'), $element.render);
                        }
                    });
                });
            }
        };
    });