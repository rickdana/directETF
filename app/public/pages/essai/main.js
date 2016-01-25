angular.module('DirectETF', [])
    .factory('SimulationFactory', function() {
        //get the date of next month
        var next_month = function(date) {
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
        var formatDate = function(date) {
            var d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            return [year, month, day].join('-');
        }

        var simulation_future = function(ref_etfs, time_frame, data_valo_today, left_vol, right_vol, versement_par_mois) {

            var simulation_future_etfs_moins_vola = {};
            var simulation_future_etfs_ajoute_vola = {};
            var data_simu_future = [];
            var firstDay = formatDate(data_valo_today);


            //ref-etfs = [isin, qdt, price, rentabilite, volatilite, pourcentage]
            for (var i in ref_etfs) {
                var taux_rentabilite = ref_etfs[i][3];
                var value_etf = ref_etfs[i][1] * ref_etfs[i][2];
                var quantity_ajoute_par_moi = versement_par_mois * ref_etfs[i][5] / 100 / ref_etfs[i][2];
                var month = firstDay;
                var left_volatilite = ref_etfs[i][4] * left_vol ;
                var right_volatilite = ref_etfs[i][4] * right_vol;


                for (var j = 1; j <= 12 * time_frame; j++) {
                    if(typeof simulation_future_etfs_moins_vola[month] == 'undefined') {
                        simulation_future_etfs_moins_vola[month] =  Math.pow((1 + ((taux_rentabilite + left_volatilite) / 12)), j) * value_etf;
                        simulation_future_etfs_ajoute_vola[month] =  Math.pow((1 + ((taux_rentabilite + right_volatilite) / 12)), j) * value_etf;
                    } else {
                        simulation_future_etfs_moins_vola[month] +=  Math.pow((1 + ((taux_rentabilite + left_volatilite) / 12)), j) * value_etf;
                        simulation_future_etfs_ajoute_vola[month] +=  Math.pow((1 + ((taux_rentabilite + right_volatilite) / 12)), j) * value_etf;
                    }
                    value_etf = ref_etfs[i][2] * (ref_etfs[i][1] + quantity_ajoute_par_moi * j);
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

        var draw_simulation_future = function(ref_etfs_new_invests, timeframe, versement_par_mois, montant_initial) {
            //simulation-graph of the future
            var data_valo_today = new Date().getTime();
            var data_invest_future_attendu = simulation_future(ref_etfs_new_invests, timeframe, data_valo_today, -1, 1, versement_par_mois);
            var data_invest_future_favorable = simulation_future(ref_etfs_new_invests, timeframe, data_valo_today, 1, 1.35, versement_par_mois);
            var data_invest_future_defavorable = simulation_future(ref_etfs_new_invests, timeframe, data_valo_today, -3, -1, versement_par_mois);
            var month = formatDate(data_valo_today);
            var data_investissement = [];
            //courbe investissement
            for (var j = 1; j <= 12 * timeframe; j++) {
                data_investissement.push([new Date(month).getTime(), parseInt(montant_initial)+ versement_par_mois * (j - 1)]) //?????il n'y a pas de invest du premier mois
                month = next_month(month);
            }
            data_investissement.sort(function (a, b) {
                return a[0] - b[0];
            });

            //simulation-graph of the future
            var series = [{
                name: 'Prévision - favorable 13%',
                id: 'Prévision_2',
                type: 'arearange',
                data: data_invest_future_favorable,
                color:'#28939D',
                zIndex: 11,
                threshold: null,
                showInLegend: false,
            },{
                name: 'Prévision - 68%',
                id: 'Prévision_1',
                type: 'arearange',
                data: data_invest_future_attendu,
                color:  '#36c6d3' ,
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
            },{
                name: 'Investissement',
                //id: 'Prévision_3',
                type: 'spline',
                data: data_investissement,
                color: '#044677',
                zIndex: 15,
                threshold: null,
                showInLegend: false
            }];

            LoadStockChart(series, $('#questionaire-future-stockchart'), true, function (chart) {
                var min = Math.floor(chart.yAxis[0].dataMin);

                chart.yAxis[0].setExtremes(min, Math.floor(chart.yAxis[0].dataMax) * 2);
                chart.yAxis[0].options.startOnTick = false;

                chart.yAxis[0].update({
                    opposite: true,
                    labels: {
                        align: 'left'
                    }
                });

                chart.tooltip.options.formatter = function() {
                    //var xyArr=[];
                    //$.each(this.points,function(){
                    //    console.log(this.series)
                    //    xyArr.push(this.series.name);
                    //});
                    //return xyArr.join('<br/>');
                    return false;
                }
            });

            //$('#simulation-future').highcharts().legend.allItems[0].update({name:'Prévision sans nouveaux investissements'});
        }

        return {
            draw_simulation_future: draw_simulation_future
        }
    })
    .controller('EssaiController', function($scope, $element, $http, SimulationFactory) {
        $('body').addClass('overlay');

        var _etfs_infos = null;

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

        $scope.model = {
            goal: null,
            amountMonthlySlider: 100,
            amountMonthlyInput: 100,
            amountMonthlyMin: 100,
            amountMonthlyMax: 2000,
            revenueYearly: 0,
            age: 0,
            amountInitialSlider: 1000,
            amountInitialInput: 1000,
            amountInitialMin: 1000,
            amountInitialMax: 50000,
            riskLevel: 0,
            timeframe: 20,
            timeframeMin: 3,
            timeframeMax: 50,

            // Slider ammount
           sliderAmount : {
            options: {
                floor: 1000,
                ceil: 50000,
                step: 500,
                showSelectionBar: true,
                hideLimitLabels: true,
                translate: function(value) {
                    return value + ' €' ;
                }
            }
           },

            sliderAmountMonthly : {
                options: {
                    floor: 100,
                    ceil: 2000,
                    step: 100,
                    showSelectionBar: true,
                    hideLimitLabels: true,
                    translate: function(value) {
                        return value + ' €';
                    }
                }
            },

        };

        $scope.$watch(function() {
            return  $scope.model.riskLevel;
        }, function() {
            $scope.synthese();
        });

        $scope.synthese = function() {
            var done = function (etfs) {
                var etfs_infos = [],
                    montant = $scope.model.amountInitialInput;

                for(var i in etfs) {
                    //var quantity = Math.floor (montant * etfs[i].percent / 100 / etfs[i].price);
                    var quantity = montant * etfs[i].percent / 100 / etfs[i].price;
                    etfs_infos.push([etfs[i].isin, quantity, etfs[i].price, etfs[i].profitability, etfs[i].volatility, etfs[i].percent]);
                }


                SimulationFactory.draw_simulation_future(etfs_infos, $scope.model.timeframe, $scope.model.amountMonthlyInput, $scope.model.amountInitialInput);
                _etfs_infos = etfs_infos;


            };

            var load_etf = function(isin, done) {
                $http.get(WS_URL + '/etf/desc/' + isin)
                    .success(function (desc, status, headers, config) {
                        $http.get(WS_URL + '/etf/price/' + isin)
                            .success(function (__data) {
                                desc.price = 0;

                                for (var __p in __data) {
                                    desc.price = __data[__p] || 0;
                                }

                                done(desc);
                            })
                            .error(function(data, status, headers, config) {
                                desc.price = 0;

                                done(desc);

                                throw new Error("Failed to get price of ETF " + isin);
                            });
                    })
                    .error(function(data, status, headers, config) {
                        console.error("Failed to get description of ETF %s", isin);
                    });
            }

            var risk = $scope.model.riskLevel > 50 ? 'high' : 'low';

            $http.get(WS_URL + '/portfolio/model/home/500/' + risk)
                .success(function (model, status, headers, config) {
                    var etfs = [];

                    for (var i = 0; i < model.composition.length; i++) {
                        var isin = model.composition[i][0];
                        var percent = model.composition[i][1];

                        load_etf(isin, (function(percent) {
                            return function(etf) {
                                etf.percent = percent;
                                etfs.push(etf);

                                if (etfs.length == model.composition.length) {
                                    // end of list
                                    done(etfs);
                                }
                            }
                        })(percent));
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

        $scope.$watch(function() {
            return $scope.model.amountInitialSlider;
        }, function(value) {
            $scope.model.amountInitialInput = value;
        });

        $scope.$watch(function() {
            return $scope.model.amountMonthlySlider;
        }, function(value) {
            $scope.model.amountMonthlyInput = value;
        });

        $scope.$watch(function() {
            return $scope.model.amountInitialInput;
        }, function(montant) {
            if ($scope.step == limit) {
                for (var i in _etfs_infos) {
                    var quantity = montant * _etfs_infos[i][5] / 100 / _etfs_infos[i][2];
                    _etfs_infos[i][1] = quantity;
                }
                SimulationFactory.draw_simulation_future(_etfs_infos, $scope.model.timeframe, $scope.model.amountMonthlyInput, $scope.model.amountInitialInput);;
            }
        });

        $scope.$watch(function() {
            return $scope.model.timeframe;
        }, function(value) {
            SimulationFactory.draw_simulation_future(_etfs_infos, $scope.model.timeframe, $scope.model.amountMonthlyInput, $scope.model.amountInitialInput);;
        });

        $scope.$watch(function() {
            return $scope.model.amountMonthlyInput;
        }, function(value) {
            if ($scope.step == limit) {
                SimulationFactory.draw_simulation_future(_etfs_infos, $scope.model.timeframe, $scope.model.amountMonthlyInput, $scope.model.amountInitialInput);;
            }
        });
    });