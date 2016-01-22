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
    .factory('SimulationFactory', function($PortfolioFactory) {
        //format utc to yyyy/mm/dd
        var formatDate = function (date) {
            var d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            return [year, month, day].join('-');
        }

        //Simulation future
        var simulation_future = function (ref_etfs, time_frame, data_valo_today, left_vol, right_vol) {
            var simulation_future_etfs_moins_vola = {};
            var simulation_future_etfs_ajoute_vola = {};
            var data_simu_future = [];

            var firstDay = formatDate(data_valo_today[0]);

            //ref-etfs = [isin, qdt, price, rentabilite, volatilite, pourcentage]
            for (var i in ref_etfs) {
                var taux_rentabilite = ref_etfs[i][3];
                var value_etf = ref_etfs[i][1] * ref_etfs[i][2];
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

        var draw_simulation_future = function (data_valo, ref_etfs_new_invests, time_frame, amount_add) {
            //simulation-graph of the future
            var data_valo_today;
            if (data_valo.length == 0) {  //for the deomo
                data_valo_today = [new Date().getTime(), amount_add];
            } else {
                data_valo_today = data_valo[data_valo.length - 1];
            }

            var data_invest_future_attendu = simulation_future(ref_etfs_new_invests, time_frame, data_valo_today, -1, 1);
            var data_invest_future_favorable = simulation_future(ref_etfs_new_invests, time_frame, data_valo_today, 1, 1.35);
            var data_invest_future_defavorable = simulation_future(ref_etfs_new_invests, time_frame, data_valo_today, -2.5, -1);

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
            }];

            LoadStockChart(series, $('#simulation-future'), true);

            var chart =  $('#simulation-future').highcharts();

            chart.yAxis[0].update({
                opposite: true,
                labels: {
                    align: 'left'
                }
            });

            var min = Math.floor(chart.yAxis[0].dataMin);
            chart.yAxis[0].options.startOnTick = false;
            chart.yAxis[0].setExtremes(min, Math.floor(chart.yAxis[0].dataMax) * 2 );

            //$('#simulation-future').highcharts().legend.allItems[0].update({name:'Prévision sans nouveaux investissements'});
        }

        //get the date of next month
        var next_month = function (date) {
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

        var new_keywords_added = function(keywords_new_strategy, keywords_wallet_strategy) {
            var new_keywords = [];
            var keywords = [];
            for (var i in keywords_new_strategy) {
                var isNew = true;
                for (var j in keywords_wallet_strategy) {
                    if (keywords_new_strategy[i] == keywords_wallet_strategy[j]) {
                        isNew = false;
                    }
                }
                if (isNew) {
                    new_keywords.push(keywords_new_strategy[i]);
                }
            }

            for (var i in new_keywords) {
                keywords.push($PortfolioFactory.Keywords.get(new_keywords[i]).name);
            }

            return keywords;
        }

        var keywords_deleted = function (keywords_new_strategy, keywords_wallet_strategy) {
            var list = [];
            var keywords = [];
            for (var i in keywords_wallet_strategy) {

                for (var j in keywords_new_strategy) {
                    if (keywords_wallet_strategy[i] == keywords_new_strategy[j]) {
                        break;
                    }
                }

                j++;

                if (j == keywords_new_strategy.length  && keywords_new_strategy[j] != keywords_wallet_strategy[i]) {
                    list.push(keywords_wallet_strategy[i]);
                }
            }

            for (var i in list) {
                keywords.push($PortfolioFactory.Keywords.get(list[i]).name);
            }


            return keywords;
        }

        return {
            draw_simulation_future: draw_simulation_future,
            new_keywords_added: new_keywords_added,
            keywords_deleted: keywords_deleted,
        }

    })
    .controller('WizardController', function($ClientFactory, $PortfolioFactory, $OrdersFactory, $rootScope, $scope, $element, $ocLazyLoad, ngDialog, $window) {
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
            },
            order: {
                amount: {
                    adding: null,
                    total: $scope.client.portfolio.value
                },
                process: function() {
                    // Confirmation
                    ngDialog.open({
                        template: '<p class="text-center">La transaction sera effectuée ce soir à 22h45</p>',
                        plain: true
                    });

                    // Open the portfolio page
                    setTimeout(function() {
                        $window.location.href = '/dashboard';
                    }, 2000);
                }
            },
            share: function() {
                ngDialog.open({
                    template: '<h2 class="text-center">:-(</h2><p class="text-center">Il n\'est pas encore possible de partager une stratégie.</p>',
                    plain: true
                });
            }
        };

        $scope.sentence = {
            keywords: []
        };

        $ClientFactory.portfolio.infos(function(err, infos) {
            $scope.wizard.portfolio = new $PortfolioFactory.Portfolio(infos);

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
        });

        $scope.$watch(function() {
            return $scope.wizard.order.amount.adding;
        }, function(value) {
            $scope.wizard.order.amount.total = $scope.client.portfolio.value + (parseFloat(value || 0) || 0);
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = true;
        $rootScope.settings.layout.pageSidebarClosed = false;
    })
    .controller('InvestirController', function($OrdersFactory, $rootScope, $scope, $element) {
        $scope.$OrdersFactory = $OrdersFactory;

        $scope.affichageListeEtfs = function() {
            $element.find('#maps-container').toggle();
            $element.find('#sectors-overview').toggle();
            $element.find('#types-overview').toggle();
            $element.find('#list-overview').toggle();
        };

        $rootScope.step1 = function () {};
    })
    .controller('InvestirMontantAjustementController', function($OrdersFactory, $rootScope, $scope, $element) {
        $scope.sliderInvestLimit = {
            value: 0,
            options: {
                floor: 0,
                ceil: $scope.client.portfolio.cash,
                step: 0.1,
                precision: 2,
                showSelectionBar: true,
                hideLimitLabels: true,
                translate: function(value) {
                    return value + ' ' + $scope.client.portfolio.currencySymb;
                }
            }
        };

        $scope.$OrdersFactory = $OrdersFactory;

        $rootScope.step2 = function () {
            $scope.sliderInvestLimit.value = $OrdersFactory.cash();
            $scope.sliderInvestLimit.options.floor = $scope.sliderInvestLimit.value;

            $element.find('[ng-etf-list]').attr('data-filter', '');

            $element.find('[ng-etf-list]')
                    .attr('data-filter', JSON.stringify($OrdersFactory.get()));
        };

        $scope.$watch(function() {
            return $scope.client.portfolio.cash;
        }, function(cash) {
            $scope.sliderInvestLimit.options.ceil = cash;
        });

        $scope.$watch(function() {
            return $scope.sliderInvestLimit.value;
        }, function(limit) {
            $OrdersFactory.distribution($scope.etfs, limit);
        });
    })
    .controller('InvestirRevoirController', function ($ClientFactory, $OrdersFactory, $EtfsFactory, $rootScope, $scope, $element, SimulationFactory) {
        var _invest_etfs = null;
        var _data_valo = null;

        $scope.model = {};

        $rootScope.step3 = function () {
            if (!$scope.model.strategies) {
                setTimeout(function() {
                    $scope.simulation();
                }, 100);

                $scope.model.strategies = {
                    //'Stratégie neutre': $scope.client.portfolio.strategy,
                    'Nouvelle stratégie': $scope.wizard.portfolio.strategy,
                };
            }
        };

        $scope.timeframe = 10;

        $scope.sliderTimeframe = {
            options: {
                floor: 3,
                ceil: 50,
                showSelectionBar: true,
                hideLimitLabels: true,
                onEnd: function () {
                    SimulationFactory.draw_simulation_future(_data_valo, _invest_etfs, $scope.timeframe, $scope.wizard.order.amount.total);
                },
                translate: function(x) {
                    return x + 'ans';
                }
            }
        };

        $('#tab-simulation a[href="/investir/#tab_1"]').on('shown.bs.tab', function() {
            $(window).resize();
        })

        $scope.newKeywords = function() {
            if (!$scope.wizard.portfolio) {
                return [];
            }
            return SimulationFactory.new_keywords_added($scope.wizard.portfolio.strategy.keywords.get(), $scope.client.portfolio.strategy.keywords.get());
        }

        $scope.deletedKeywords = function() {
            if (!$scope.wizard.portfolio) {
                return [];
            }
            return SimulationFactory.keywords_deleted($scope.wizard.portfolio.strategy.keywords.get(), $scope.client.portfolio.strategy.keywords.get());
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

                    $scope.simulation = function () {
                        var ref_etfs = []
                        var invest_etfs = [];
                        for(var i in etfs_with_gains) {
                            ref_etfs.push([etfs_with_gains[i].isin, etfs_with_gains[i].quantity, etfs_with_gains[i].price, etfs_with_gains[i].profitability, etfs_with_gains[i].volatility]);
                            invest_etfs.push([etfs_with_gains[i].isin, etfs_with_gains[i].quantity, etfs_with_gains[i].price, etfs_with_gains[i].profitability, etfs_with_gains[i].volatility]);
                        }
                        var orders = $OrdersFactory.get();

                        $EtfsFactory.loadAll(function(etfs_list) {
                            var etfs_strategy = $scope.wizard.portfolio.strategy.cross(etfs_list);
                            var etfs_strategy_simulation = [];

                            for (var i in etfs_strategy) {
                                var etf = etfs_strategy[i];

                                etfs_strategy_simulation.push([etf.isin, etf.quantity || 1, etf.price, etf.profitability, etf.volatility]);
                            }

                            SimulationFactory.draw_simulation_future(data_valo, etfs_strategy_simulation, $scope.timeframe, $scope.wizard.order.amount.total);

                            _invest_etfs = etfs_strategy_simulation;
                            _data_valo = data_valo;
                        });
                    };
                });
            });
        });

        //setTimeout(function() {
        //    $scope.wizard.goto(3);
        //}, 500)
    })
    .controller('InvestirValidationController', function($OrdersFactory, $rootScope, $scope, $element) {
        $rootScope.step4 = function () {};
    });

