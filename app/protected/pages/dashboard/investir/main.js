angular.module('MetronicApp')
    .factory('$OrdersFactory', function() {
        var etfs = {};
        var quantities = {};
        var locked = false;

        return {
            lock: function() {
                locked = true;
            },
            unlock: function() {
                locked = false;
            },
            set: function(etf, quantity) {
                if (locked) {
                    return;
                }
                if (!etfs[etf.isin]) {
                    etfs[etf.isin] = etf;
                    quantities[etf.isin] = etf.quantity;

                    return console.log("-> %s(quantity: %s, price: %s) was added in the selection list", etf.isin, etf.quantity, etf.price);
                }

                if (typeof quantity != 'undefined') {
                    quantities[etf.isin] = parseInt(quantity);
                } else {
                    quantity = quantities[etf.isin];
                }

                console.log("-- Set %s(quantity: %s, price: %s)", etf.isin, quantity, etf.price);
            },
            get: function(isin) {
                if (isin) {
                    if (etfs[isin]) {
                        return etfs[isin];
                    }
                    return null;
                }

                var array = [];

                for (var isin in etfs) {
                    if (etfs[isin] && quantities[isin]) {
                        etfs[isin].quantity = quantities[isin];
                        array.push(etfs[isin]);
                    }
                }

                return array;
            },
            length: function() {
                var i = 0;

                for (var isin in etfs) {
                    if (quantities[isin]) {
                        i++;
                    }
                }

                return i;
            },
            cash: function() {
                var cash = 0;

                for (var isin in quantities) {
                    cash += quantities[isin] * etfs[isin].price;
                }

                return cash;
            },
            distribution: function($etfs, limit) {
                if (!$etfs || !$etfs.length) {
                    return;
                }

                var initial_cash = 0;
                var percents = {};
                var ratio = limit / initial_cash;

                for (var i in $etfs) {
                    initial_cash += $etfs[i].price;
                }

                for (var i in $etfs) {
                    percents[$etfs[i].isin] = $etfs[i].price / initial_cash;
                }

                this.unlock();

                for (var i in $etfs) {
                    var isin = $etfs[i].isin;
                    var quantity = Math.floor(percents[isin] * limit / etfs[isin].price);

                    $etfs[i].quantity = quantity;
                    this.set($etfs[i], quantity);
                }

                var diff = limit - this.cash();

                while (diff > 0) {
                    for (var i = 0, j = 0; i < $etfs.length; i++) {
                        if ($etfs[i].price <= diff) {
                            this.set($etfs[i], ++$etfs[i].quantity);
                            diff -= $etfs[i].price;

                            if (diff <= 0) {
                                j = i;
                                break;
                            }
                        } else {
                            j++;
                        }
                    }

                    if (i == j) {
                        break;
                    }
                }

                this.lock();
            }
        };
    })
    .controller('WizardController', function($ClientFactory, $PortfolioFactory, $OrdersFactory, $rootScope, $scope, $element, $ocLazyLoad) {
        $ocLazyLoad.load({
            insertBefore: '#ng_load_plugins_before',
            files: [
                '/protected/pages/dashboard/investir/style.css'
            ]
        });

        $scope.$on('$viewContentLoaded', function() {
            // initialize core components
            App.initAjax();
        });

        var wizard_state = $element.find("#wizard-state");

        $scope.wizard = {
            step: 1,
            goto: function(step) {
                var active = $element.find('[data-step=' + this.step + ']'),
                    current = $element.find('[data-step=' + step + ']');

//                if (active.attr('data-step') == current.attr('data-step')) {
//                    return false;
//                }
//
//                if (current.attr('data-step') == 2 && $OrdersFactory.length() == 0) {
//                    return false;
//                }
//
//                if (wizard_state.find('[data-step=' + (current.attr('data-step') - 1) + ']').attr('data-state') == 'unvalid') {
//                    return false;
//                }

                this.step = step;

                console.log("Go to step " + current.attr('data-step'));

                $rootScope['step' + current.attr('data-step')]();
                $OrdersFactory.lock();

                document.body.scrollTop = 0;
            }
        };

        $scope.sentence = {
            keywords: []
        };

        $scope.wizard.order = {
            amount: {
                adding: null,
                total: $scope.client.portfolio.value
            }
        }

        $ClientFactory.portfolio.infos(function(err, infos) {
            $scope.wizard.portfolio = new $PortfolioFactory.Portfolio(infos);
        });

        $scope.$watch(function() {
            return $scope.wizard.order.amount.adding;
        }, function(value) {
            $scope.wizard.order.amount.total = $scope.client.portfolio.value + (parseFloat(value || 0) || 0);
        });

        $scope.$watch(function() {
            return $scope.wizard.portfolio.strategy.keywords.length();
        }, function() {
            $scope.wizard.portfolio.strategy.etfs(function(etfs) {
                $scope.wizard.portfolio.isins = [];

                for (var i in etfs) {
                    $scope.wizard.portfolio.isins.push(etfs[i].isin);
                }

                console.log('==>', $scope.wizard.portfolio.isins)
            });
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = true;
        $rootScope.settings.layout.pageSidebarClosed = false;
    })
    .controller('InvestirController', function($OrdersFactory, $rootScope, $scope) {
        $scope.$OrdersFactory = $OrdersFactory;

        $rootScope.step1 = function () {};
    })
    .controller('InvestirMontantAjustementController', function($OrdersFactory, $rootScope, $scope, $element) {
        $rootScope.step2 = function () {};

        //$OrdersFactory.distribution($scope.etfs, limit);
    })
    .controller('InvestirRevoirController', function ($OrdersFactory, $ClientFactory, $EtfsFactory, $rootScope, $scope, $element) {
        var _invest_etfs = null;
        var _ref_etfs = null;
        var _data_valo = null;

        $rootScope.step1 = function () {
            $scope.wizard.portfolio.strategy.etfs(function(etfs) {
                for (var i in etfs) {
                    $OrdersFactory.set(etfs[i]);
                }

                console.log('$OrdersFactory.get:', $OrdersFactory.get())
            });

            setTimeout(function() {
                $scope.runSimulation();
            }, 500);
        };

        $scope.timeframe = 20;

        $scope.sliderTimeframe = {
            options: {
                floor: 3,
                ceil: 50,
                showSelectionBar: true,
                hideLimitLabels: true,
                onEnd: function () {
                    draw_simulation_future(_data_valo, _ref_etfs, _invest_etfs);
                },
                translate: function() {
                    return '';
                }
            }
        };



        $('#tab-simulation a[href="/investir/#tab_1"]').on('shown.bs.tab', function() {
            $(window).resize();
        })

        //regroup the invests
        function join_simulation(simulation, simulation_total) {
            for (var i in simulation) {
                for (var date in simulation[i]) {
                    if (typeof simulation_total[date] == 'undefined') {
                        simulation_total[date] = simulation[i][date];
                    } else {
                        simulation_total[date] += simulation[i][date];
                    }
                }
            }

            return simulation_total;
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

        //Proportion des ETFS d'un nouvel investissement
        function proportion_etfs(ref_etfs) {
            var proportion_etfs = [];
            var montant = $scope.wizard.order.amount.total;

            for (var i in ref_etfs) {
                var proportion = ref_etfs[i][3] / montant;
                proportion_etfs.push([ref_etfs[i][0], proportion])
            }

            return proportion_etfs;
        }

        //Simulation passée
        function simulation_past(ref_etfs, valo, data_valo, done_simulation) {
            var simulation_etfs = [],
                simul_etfs = {},
                index = 0,
                n = ref_etfs.length,
                prices_concat = [],
                firstDay = formatDate(data_valo[0][0]);

            var prices_callback = function (err, prices) {
                var value_etf_firstDay = 0;

                firstDayloop:
                    for (var i = 0, size = prices.length; i < size; i++) {
                        for (var date in prices[i]) {
                            if (date == firstDay) {
                                value_etf_firstDay = ref_etfs[index - 1][1] * prices[i][date];
                                break firstDayloop;
                            }
                        }
                    }

                for (var i = 0, size = prices.length; i < size; i++) {
                    for (var date in prices[i]) {
                        //evolutions de tous etfs
                        prices[i][date] = prices[i][date] * ref_etfs[index - 1][1] - value_etf_firstDay;
                    }
                }

                prices_concat = prices_concat.concat(prices);

                if (index == n) {
                    simul_etfs = join_simulation(prices_concat, simul_etfs);
                    for (var date_valo in valo) {
                        for (var date in simul_etfs) {
                            if (date == date_valo) {
                                simulation_etfs.push([new Date(date).getTime(), simul_etfs[date] + valo[date_valo]]);
                            }
                        }
                    }

                    simulation_etfs.sort(function (a, b) {
                        return a[0] - b[0];
                    });

                    done_simulation(simulation_etfs);

                    return;
                }

                $EtfsFactory.prices(ref_etfs[index++][0], prices_callback);
            };

            $EtfsFactory.prices(ref_etfs[index++][0], prices_callback);
        }

        //Simulation future
        function simulation_future(ref_etfs, time_frame, data_valo_today, left_vol, right_vol) {
            var simulation_future_etfs = {};
            var simulation_future_etfs_moins_vola = {};
            var simulation_future_etfs_ajoute_vola = {};
            var data_simu_future = [];

            var firstDay = formatDate(data_valo_today[0]);

            //ref-etfs = [isin, qdt, price, rentabilite, volatilire]
            for (var i in ref_etfs) {
                var taux_rentabilite = ref_etfs[i][3];
                var value_etf = ref_etfs[i][1] * ref_etfs[i][2];
                var month = firstDay;
                var left_volatilite = ref_etfs[i][4] * left_vol * ref_etfs[i][1];
                var right_volatilite = ref_etfs[i][4] * right_vol * ref_etfs[i][1];

                simulation_future_etfs[month] = value_etf;
                if(typeof simulation_future_etfs_moins_vola[month] == 'undefined') {
                    simulation_future_etfs_moins_vola[month] = simulation_future_etfs[month];
                    simulation_future_etfs_ajoute_vola[month] = simulation_future_etfs[month];
                } else {
                    simulation_future_etfs_moins_vola[month] += simulation_future_etfs[month];
                    simulation_future_etfs_ajoute_vola[month] += simulation_future_etfs[month];
                }

                for (var i = 0; i < time_frame; i++) {
                    for (var j = 1; j <= 12; j++) {
                        month = next_month(month);
                        simulation_future_etfs[month] = value_etf * (taux_rentabilite / 12 * j + 1);
                        if(typeof simulation_future_etfs_moins_vola[month] == 'undefined') {
                            simulation_future_etfs_moins_vola[month] = simulation_future_etfs[month] + left_volatilite;
                            simulation_future_etfs_ajoute_vola[month] = simulation_future_etfs[month] + right_volatilite;
                        } else {
                            simulation_future_etfs_moins_vola[month] += simulation_future_etfs[month] + left_volatilite;
                            simulation_future_etfs_ajoute_vola[month] += simulation_future_etfs[month] + right_volatilite;
                        }
                    }
                    value_etf *= (1 + taux_rentabilite);
                }
            }
            for (var date in simulation_future_etfs) {
                var low = parseFloat(simulation_future_etfs_moins_vola[date].toFixed(2));
                var high = parseFloat(simulation_future_etfs_ajoute_vola[date].toFixed(2));
                data_simu_future.push([new Date(date).getTime(), low, high]);
            }

            data_simu_future.sort(function (a, b) {
                return a[0] - b[0];
            });

            return data_simu_future;

        }



        function draw_simulation_future(data_valo, ref_etfs, ref_etfs_new_invests) {
            //simulation-graph of the future
            var time_frame = $scope.timeframe;
            var data_valo_today = data_valo[data_valo.length - 1];

            var data_invest_future_attendu = simulation_future(ref_etfs_new_invests, time_frame, data_valo_today, -1, 1);
            var data_invest_future_favorable = simulation_future(ref_etfs_new_invests, time_frame, data_valo_today, 1, 2);
            var data_invest_future_defavorable = simulation_future(ref_etfs_new_invests, time_frame, data_valo_today, -2, -1);


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

            LoadStockChart(series, $('#simulation-future'), true);

            //$('#simulation-future').highcharts().legend.allItems[0].update({name:'Prévision sans nouveaux investissements'});
        }


        //taux de rentabilité
        function rate_change_year(data) {
            var rentabilite = 0;
            var capital = data[0][1];
            var profit = data[data.length - 1][1] - capital;
            var time_diff = Math.abs(data[data.length - 1][0] - data[0][0]);
            var days_diff = Math.ceil(time_diff / (1000 * 3600 * 24));

            //nombre de jours ouverts est 365
            rentabilite = profit / capital * 365 / days_diff;
            return rentabilite;
        }


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

        $ClientFactory.portfolio.valo(function (err, valo, data_valo) {
            if (err) {
                throw err;
            }

            // Trades
            $ClientFactory.portfolio.trades(function (err, trades) {
                if (err) {
                    throw err;
                }

                var data_trades = [];
                var trades_by_date = {};
                var somme_trades = 0;

                //CASHIN and STOCKIN
                for (var x in data_valo) {
                    for (var i in trades) {
                        if ((trades[i].type == 'CASHIN' || trades[i].type == 'STOCKIN') && data_valo[x][0] == new Date(trades[i].date).getTime()) {
                            somme_trades += trades[i].cash;
                        }
                    }
                    trades_by_date[new Date(data_valo[x][0])] = somme_trades;
                }

                for (var date in trades_by_date) {
                    data_trades.push([new Date(date).getTime(), trades_by_date[date]]);
                }
                data_trades.sort(function (a, b) {
                    return a[0] - b[0];
                });

                //Investements
                var invest_etfs = [];

                $ClientFactory.portfolio.etfs(function(err, etfs_with_gains) {
                    if (err) {
                        return console.error(err);
                    }

                    $rootScope.runSimulation = function () {
                        var ref_etfs = []
                        var invest_etfs = [];
                        for(var i in etfs_with_gains) {
                            ref_etfs.push([etfs_with_gains[i].isin, etfs_with_gains[i].quantity, etfs_with_gains[i].price, etfs_with_gains[i].profitability, etfs_with_gains[i].volatility]);
                            invest_etfs.push([etfs_with_gains[i].isin, etfs_with_gains[i].quantity, etfs_with_gains[i].price, etfs_with_gains[i].profitability, etfs_with_gains[i].volatility]);
                        }
                        var orders = $OrdersFactory.get();

                        if (orders.length) {
                            for (var i = 0; i < orders.length; i++) {
                                invest_etfs.push([orders[i].isin, orders[i].quantity, orders[i].price, orders[i].profitability, orders[i].volatility]);
                            }

                            simulation_past(invest_etfs, valo, data_valo, simulation_cb);
                            draw_simulation_future(data_valo, ref_etfs, invest_etfs);
                            _ref_etfs = ref_etfs;
                            _invest_etfs = invest_etfs;
                            _data_valo = data_valo;

                        }
                    };

                });


                function simulation_cb(invest_simu_past) {
                    var series = [{      //the value of portfolio
                        name: 'Portefeuille',
                        type: 'spline',
                        data: data_valo,
                        color: 'rgb(50, 197, 210)',
                        fillOpacity: 0.2
                    }, {        //trades of client
                        name: 'Investissement',
                        data: data_trades,
                        type: 'spline',
                        color: 'rgb(111, 111, 119)',
                        fillOpacity: 0.15,
                        //yAxis: 1,
                        dashStyle: 'ShortDot'
                    }, {
                        name: 'Nouveaux investissements',
                        data: invest_simu_past,
                        type: 'spline',
                        color: '#5cc586',
                        fillOpacity: 0.15,
                    }];


                    //simulation-graph of the past
                    LoadStockChart(series, $('#simulation-past'), true);


                    var chart =  $('#simulation-past').highcharts();
                    chart.rangeSelector.buttons[4].setState(2);
                    chart.rangeSelector.clickButton(4,4,true);
                    //Benefice
                    $rootScope.profit = invest_simu_past[invest_simu_past.length - 1][1] - data_valo[data_valo.length - 1][1]
                        - (invest_simu_past[0][1] - data_valo[0][1]);

                    //draw_simulation_future(data_valo, invest_simu_past);
                    //
                    //_invest_simu_past = invest_simu_past;
                    //_data_valo = data_valo;
                }

            });
        });

        //[
        //    {"profitability":0.015,"sectors":[{"Finance":100}],"name":"Lyxor MSCI World UCITS ETF","description":"","countries":[{"US":100}],"volatility":1.46,"isin":"FR0010315770","countriesStr":"US","sectorsStr":"Finance","price":14.06,"$$hashKey":"object:107","quantity":1,"enabled":true},
        //    {"profitability":0.01,"sectors":[{"Industrie":100}],"name":"Lyxor MSCI USA","description":"","countries":[{"US":100}],"volatility":37.64,"isin":"QS0011029939","countriesStr":"US","sectorsStr":"Industrie","price":191.92,"$$hashKey":"object:219","quantity":1,"enabled":true},
        //    {"profitability":0.003,"sectors":[{"Technologies de l'information":100}],"name":"Lyxor Smart Cash - UCITS ETF C-EUR","description":"","countries":[{"FR":100}],"volatility":0.29,"isin":"LU1190417599","countriesStr":"FR","sectorsStr":"Technologies de l'information","price":125,"$$hashKey":"object:225","quantity":1,"enabled":true},
        //    {"profitability":0.01,"sectors":[{"Technologies de l'information":100}],"name":"Lyxor MSCI USA UCITS ETF","description":"","countries":[{"US":100}],"volatility":0.2,"isin":"FR0010296061","countriesStr":"US","sectorsStr":"Technologies de l'information","price":334.73,"$$hashKey":"object:237","quantity":1,"enabled":true},
        //    {"profitability":0.002,"sectors":[{"Finance":100}],"name":"Lyxor EURO STOXX 50 CHF Daily Hedged UCITS ETF","description":"","countries":[{"FR":100}],"volatility":0.3,"isin":"FR0012399731","countriesStr":"FR","sectorsStr":"Finance","price":60.59,"$$hashKey":"object:251","quantity":1,"enabled":true}
        //].forEach(function(etf) {
        //        $OrdersFactory.set(etf);
        //    });
        //
        //setTimeout(function() {
        //    $scope.wizard.goto(3);
        //}, 500)


    })
    .controller('InvestirValidationController', function($OrdersFactory, $rootScope, $scope, $element) {
        $scope.$OrdersFactory = $OrdersFactory;

        $rootScope.step4 = function () {
            $OrdersFactory.lock();
            setTimeout(function() {
                $scope.$apply(function() {
                    $element.find('.update-with-etfs-selection')
                        .attr('data-filter', JSON.stringify($OrdersFactory.get()));
                });
            }, 500);
        };
    });

