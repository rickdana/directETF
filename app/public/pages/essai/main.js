'use strict';

angular.module('DirectETF', [])

    .controller('EssaiController', function($scope, $element, $http) {
        $('body').addClass('overlay');



        var container = $($element[0]),
            steps = container.find('.steps'),
            prev  = container.find('.prev'),
            next  = container.find('.next');

        var width = container.find('.box').width(),
            limit = container.find('.step').length;

        container.find('.step').each(function(i) {
            $(this)
                .attr('data-step', i + 1)
                .addClass('animated')
                .css({
                    left: width + 'px',
                    right: '-' + width + 'px',
                });
        });

        container.find('label').each(function(i) {
            $(this).click(function() {
                var height = $('[data-step=' + $scope.step + ']').height()
                                + $(this).find('+ .radio-choices').outerHeight();

                steps.css('height', height + 'px');
            });
        });

        $scope.$watch(function() {
            return $scope.step;
        }, function(step, previous) {
            var last = $('[data-step=' + previous + ']'),
                current = $('[data-step=' + step + ']');

            steps.css('height', current.height() + 'px');

            if (step > previous) { // Next
                last
                    .addClass('bounceOutLeft')
                    .removeClass('bounceInRight');
                current
                    .addClass('bounceInRight')
                    .removeClass('bounceOutRight')
                    .css({
                        left: '0px',
                        right: '0px',
                    });
            } else if (step == previous) {
                // Init
                last
                    .addClass('bounceInRight')
                    .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                        $(this).removeClass('bounceInRight');
                    })
                    .css({
                        left: '0px',
                        right: '0px',
                    });
            } else { // Previous
                last
                    .addClass('bounceOutRight')
                    .removeClass('bounceInRight');
                current
                    .addClass('bounceInLeft')
                    .removeClass('bounceOutLeft')
                    .css({
                        left: '0px',
                        right: '0px',
                    });
            }
        });

        $scope.bar = {
            step: 100 / container.find('.step').length,
            value: 100 / container.find('.step').length
        };

        $scope.step = 1;
        $scope.limit = limit;

        $scope.prev = function() {
            if ($scope.step > 1) {
                $scope.step--;
                $scope.bar.value -= $scope.bar.step;
                prev.removeClass('disabled');
                next.removeClass('disabled');

                if ($scope.step == 1) {
                    prev.addClass('disabled');
                }
            }
        };

        $scope.next = function() {
            if ($scope.step < limit) {
                $scope.step++;
                $scope.bar.value += $scope.bar.step;
                next.removeClass('disabled');
                prev.removeClass('disabled');

                if ($scope.step == limit) {
                    next.addClass('disabled');
                }
            }
        };

        $scope.montant = 0;

        $scope.model = {
            risque: null,
        };

        $scope.synthese = function() {
            var done = function (etfs) {
                var etfs_infos = [],
                    montant = $scope.montant;

                for(var i in etfs) {
                    var quantity = Math.floor (montant * etfs[i].percent / 100 / etfs[i].price);
                    etfs_infos.push([etfs[i].isin, quantity, etfs[i].price, etfs[i].profitability, etfs[i].volatility]);
                }

                draw_simulation_future(etfs_infos);
            };

            var risk = $scope.model.riskLevel > 50 ? 'high' : 'low';

            $http.get('http://184.51.43.30:8080/portfolio/model/home/500/' + risk)
                .success(function (model, status, headers, config) {
                    var etfs = [];

                    for (var i = 0; i < model.composition.length; i++) {
                        var isin = model.composition[i][0];
                        var percent = model.composition[i][1];

                        $http.get('http://184.51.43.30:8080/etf/desc/' + isin)
                            .success(function (desc, status, headers, config) {
                                desc.percent = percent;

                                $http.get('http://184.51.43.30:8080/etf/price/' + isin)
                                    .success(function (__data) {
                                        desc.price = 0;

                                        for (var __p in __data) {
                                            desc.price = __data[__p] || 0;
                                        }

                                        etfs.push(desc);

                                        if (etfs.length == model.composition.length) {
                                            // end of list
                                            done(etfs);
                                        }
                                    })
                                    .error(function(data, status, headers, config) {
                                        desc.price = 0;

                                        etfs.push(desc);

                                        if (etfs.length == model.composition.length) {
                                            // end of list
                                            done(etfs);
                                        }

                                        throw new Error("Failed to get price of ETF " + isin);
                                    });
                            })
                            .error(function(data, status, headers, config) {
                                console.error("Failed to get description of ETF %s", isin);
                            });
                    }

                    //console.log(model.composition)
                })
                .error(function(data, status, headers, config) {
                    var err = new Error("Failed to get model of the risk " + riskLevel);

                    err.status = status;
                    err.headers = headers;


                    console.error(err.message);
                });
        };

        //get the date of next month
        function next_month(date) {
            var date_1 = new Date(date);
            var month = date_1.getMonth() + 1;
            var year = date_1.getFullYear();
            if (month != 12) {
                month += 1;
            } else {
                year += 1;
                month = 1;
            }


            if (month < 10) {
                return new Date(year + '-0' + month + '-01');
            } else {
                return new Date(year + '-' + month + '-01');
            }
        }

        //format utc to yyyy/mm/dd
        function formatDate(date) {
            var d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            return [year, month, day].join('-');
        }

        function simulation_future(ref_etfs, time_frame, data_valo_today, left_vol, right_vol) {
            var simulation_future_etfs = {};
            var simulation_future_etfs_moins_vola = {};
            var simulation_future_etfs_ajoute_vola = {};
            var data_simu_future = [];

            var firstDay = formatDate(data_valo_today);

            //ref-etfs = [isin, qdt, price, rentabilite, volatilire]
            for (var i in ref_etfs) {
                var taux_rentabilite = ref_etfs[i][3];
                var value_etf = ref_etfs[i][1] * ref_etfs[i][2];
                var month = firstDay;
                var left_volatilite = ref_etfs[i][4] * left_vol ;
                var right_volatilite = ref_etfs[i][4] * right_vol;

                    for (var j = 1; j <= 12 * time_frame; j++) {
                        //simulation_future_etfs[month] = Math.pow(value_etf , ((taux_rentabilite / 12) * j)) + value_etf;
                        if(typeof simulation_future_etfs_moins_vola[month] == 'undefined') {
                            simulation_future_etfs_moins_vola[month] =  Math.pow(value_etf , (((taux_rentabilite + left_volatilite) / 12) * j)) + value_etf;
                            simulation_future_etfs_ajoute_vola[month] = Math.pow(value_etf , (((taux_rentabilite + right_volatilite) / 12) * j)) + value_etf;
                        } else {
                            simulation_future_etfs_moins_vola[month] += Math.pow(value_etf , (((taux_rentabilite + left_volatilite) / 12) * j)) + value_etf;
                            simulation_future_etfs_ajoute_vola[month] += Math.pow(value_etf , (((taux_rentabilite + right_volatilite) / 12) * j)) + value_etf;
                        }
                        month = next_month(month);
                    }
                }

            for (var date in simulation_future_etfs_moins_vola) {
                var low = parseFloat(simulation_future_etfs_moins_vola[date].toFixed(2));
                var high = parseFloat(simulation_future_etfs_ajoute_vola[date].toFixed(2));
                data_simu_future.push([new Date(date).getTime(), low, high]);
            }

            data_simu_future.sort(function (a, b) {
                return a[0] - b[0];
            });

            return data_simu_future;

        }

        function draw_simulation_future(ref_etfs_new_invests) {
            //simulation-graph of the future

            var data_valo_today = new Date().getTime();

            var data_invest_future_attendu = simulation_future(ref_etfs_new_invests, 10, data_valo_today, -1, 1);
            var data_invest_future_favorable = simulation_future(ref_etfs_new_invests, 10, data_valo_today, 1, 1.5);
            var data_invest_future_defavorable = simulation_future(ref_etfs_new_invests, 10, data_valo_today, -2, -1);


            //simulation-graph of the future
            var series = [{
                name: 'Prévision - favorable 13%',
                id: 'Prévision_2',
                type: 'arearange',
                data: data_invest_future_favorable,
                color:'rgb(32, 121, 57)',
                zIndex: 11,
                threshold: null,
                showInLegend: false,
            },{
                name: 'Prévision - 68%',
                id: 'Prévision_1',
                type: 'arearange',
                data: data_invest_future_attendu,
                color:  'rgb(43, 161, 76)' ,
                zIndex: 11,
                threshold: null,
                showCheckbox: true,
                showInLegend: false
            },{
                name: 'Prévision - defavorable 13%',
                id: 'Prévision_3',
                type: 'arearange',
                data: data_invest_future_defavorable,
                color: 'rgb(255, 198, 179)',
                zIndex: 11,
                threshold: null,
                showInLegend: false
            }];

            LoadStockChart(series, $('#questionaire-future-stockchart'), true);

            //$('#simulation-future').highcharts().legend.allItems[0].update({name:'Prévision sans nouveaux investissements'});
        }
    });