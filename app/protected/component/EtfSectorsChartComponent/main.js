angular.module('MetronicApp')
    .controller('EtfSectorsChartController', function($ocLazyLoad, $EtfsFactory, $rootScope, $scope, $element, $attrs) {
        $ocLazyLoad.load({
            insertBefore: '#ng_load_plugins_before',

            files: [
                '/protected/component/EtfSectorsChartComponent/style.css'
            ]
        });

        var sector_info_box = $element.find('.sectors-overview-box');

        var render = function(etfs) {
            $element.find('.etf-sectors-pie-chart-wrapper').highcharts({
                mapNavigation: {
                   enabled: false
                },

                chart: {
                    type: 'pie',
                    plotBackgroundColor: null,
                    plotBorderWidth: 10,
                    plotShadow: false,
                    plotBorderColor: '#fff',
                    height: $attrs.height || null,
                    width: $attrs.width || null,
                    style: {
                        top: '0px',
        //                    left: '-30px'
                        'margin-bottom': '0px',
                        'font-family': 'Poiret one',
                        'font-size': '17px'
                    },
                },
                tooltip: {
                    pointFormat: ' <b>{point.percentage:.2f}%</b>'
                },
                plotOptions: {
                    pie: {
                        ignoreHiddenPoint: false,
                        allowPointSelect: true,
                        cursor: 'pointer',
                        size:'111%',
                        innerSize: 100,
                        //depth: 45,
                        dataLabels: {
                            enabled: false
                        },
                        showInLegend: true,
                        cursor: 'pointer',
                        borderWidth: 3,

                    },
                },
                series: [{
                    type: 'pie',
                    data: parse(etfs),
                    colorByPoint: true,
                    innerSize: '50%',
                    point: {
                        events: {
                            select: function (e) {
                                this.slice(false);
                            },
                        }
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
                    align: 'right',
                    verticalAlign: 'top',
                    layout: 'vertical',
                    x: 8,
                    y: -8,
                    itemMarginTop: 3,
                    itemMarginBottom: 3,
                    itemStyle:{
                        fontSize:'14px'
                    },
                    symbolHeight: 12,
                    symbolWidth: 12,
                    symbolRadius: 6,
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

        var parse = function(etfs) {
            var sum = 0
              , percents = {}
              , series = [];

            // Compute the percents by sector
            for (var i = 0; i < etfs.length; i++) {
                var etf = etfs[i];

                // for each sector of the etf
                for (var j = 0; j < etf.sectors.length; j++) {
                    for (var sector in etf.sectors[j]) {
                        if (typeof percents[sector] == 'undefined') {
                            percents[sector] = 0;
                            sum++; // count sectors
                        }

                        percents[sector] += etf.sectors[j][sector];
                    }
                }
            }

            // Build the serie
            for (var sector in percents) {
                percents[sector] = percents[sector] * 100 / sum;

                series.push({
                    name: sector,
                    y: parseFloat(percents[sector])
                });
            }

            //series[0].sliced = true;
            //series[0].selected = true;
            series.sort(function (a, b) {
                return b.y - a.y
            });

            for (var i = 3; i < series.length; i++) {
                //series[i].visible = false;
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

            $EtfsFactory.load(filter, render, false);
        });
    })
    .directive("sectorChartPie", function($EtfsFactory) {
        return {
            controller: "EtfSectorsChartController",
            restrict: 'E',
            scope: {
                model: '=model'
            },
            templateUrl: "/protected/component/EtfSectorsChartComponent/template.html"
        };
    });