angular.module('MetronicApp')
    .factory('StrategyFactory', function($PortfolioFactory, $EtfsFactory, $ClientFactory) {
        var etfs_clients = [];
        var portfolio = {
            data: {}
        };

        //format utc to yyyy/mm/dd
        var formatDate = function(date) {
            var d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;

            return [year, month, day].join('-');
        };

        //regroup the invests
        var join_simulation = function(simulation, simulation_total) {
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
        };
        
        var draw_simulation = function($element, ref_etfs, valo, data_valo, legend, done_simulation) {
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

                    done_simulation($element, legend, simulation_etfs);

                    return;
                }

                $EtfsFactory.prices(ref_etfs[index++][0], prices_callback);
            };

            console.log('===>ref_etfs: ', ref_etfs)
            $EtfsFactory.prices(ref_etfs[index++][0], prices_callback);
        };
        
        var draw = function($element) {
            var series = [{
                name: 'Portefeuille',
                type: 'spline',
                data: portfolio.data.valo,
                color: 'rgb(50, 197, 210)',
                fillOpacity: 0.2
            }, {        //trades of client
                name: 'Investissement',
                data: portfolio.data.trades,
                type: 'spline',
                color: 'rgb(111, 111, 119)',
                fillOpacity: 0.15,
                //yAxis: 1,
                dashStyle: 'ShortDot'
            }];

            //simulation-graph of the past
            LoadStockChart(series, $element, true);

            var chart =  $element.highcharts();
            chart.rangeSelector.buttons[4].setState(2);
            chart.rangeSelector.clickButton(4,4,true);
        };

        var simulation_cb = function($element, legend, invest_simu_past) {
            var serie = {
                name: legend || 'Nouveaux investissements',
                data: invest_simu_past,
                type: 'spline',
                fillOpacity: 0.15,
            };

            LoadStockChart(serie, $element, false);
        };

        var preload = function ($element, strategy_input, legend) {
            legend = legend || false;

            $EtfsFactory.loadAll(function(etfs_list) {
                var strategy = strategy_input.cross ? strategy_input : new $PortfolioFactory.Strategy(strategy_input);
                var etfs_strategy = strategy.cross(etfs_list);
                var etfs_strategy_simulation = [];

                for (var i in etfs_strategy) {
                    var etf = etfs_strategy[i];

                    etfs_strategy_simulation.push([etf.isin, etf.quantity || 1, etf.price, etf.profitability, etf.volatility]);
                }

                draw_simulation($element, etfs_strategy_simulation, portfolio.valo, portfolio.data.valo, legend, simulation_cb);
            });
        };
        
        $ClientFactory.portfolio.valo(function (err, valo, data_valo) {
            if (err) {
                throw err;
            }

            portfolio.valo = valo;
            portfolio.data.valo = data_valo;

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

                portfolio.data.trades = data_trades;

                //Investements
                $ClientFactory.portfolio.etfs(function(err, etfs_with_gains) {
                    if (err) {
                        return console.error(err);
                    }

                    for(var i in etfs_with_gains) {
                        etfs_clients.push([etfs_with_gains[i].isin, etfs_with_gains[i].quantity, etfs_with_gains[i].price, etfs_with_gains[i].profitability, etfs_with_gains[i].volatility]);
                    }
                });

            });
        });

        return {
            ready: function() {
                return portfolio.data.trades || false;
            },

            draw: draw,

            load: function(strategies, $element) {
                if (strategies instanceof Array) {
                    for (var i in strategies) {
                        preload($element, strategies[i])
                    }
                } else if (typeof strategies == 'object' && strategies !== null) {
                    for (var legend in strategies) {
                        preload($element, strategies[legend], legend)
                    }
                }
            }
        }
    })
    .controller('StrategyController', function($scope, $element, StrategyFactory) {
        $element.css('display', 'block');

        $scope.$watch(function() {
            return StrategyFactory.ready();
        }, function() {
            StrategyFactory.draw($element);
        });

        $scope.$watch(function() {
            return $scope.strategies;
        }, function(strategies) {
            StrategyFactory.load(strategies, $element);
        });
    })
    .directive("strategyComparison", function() {
        return {
            controller: "StrategyController",
            restrict: 'E',
            scope: {
                strategies: '=strategies'
            }
        };
    });