angular.module('MetronicApp')
    .factory('$OrdersFactory', function() {
        var etfs = {};
        var locked = false;

        return {
            lock: function() {
                locked = true;
            },
            unlock: function() {
                locked = false;
            },
            set: function(isin, quantity, price) {
                if (locked) {
                    return;
                }
                if (!etfs[isin]) {
                    if (typeof quantity == 'undefined') {
                        throw new Error('Quantity of ' + isin + ' must be set!');
                    }
                    if (typeof price == 'undefined') {
                        throw new Error('Price of % ' + isin + ' must be set!');
                    }

                    if (!etfs[isin]) {
                        etfs[isin] = {
                            isin: isin,
                            quantity: quantity,
                            price: price,
                            cash: quantity * price,
                        };
                    }
                    return console.log("-> %s(quantity: %s, price: %s) was added in the selection list", isin, quantity, price);
                }

                if (typeof quantity != 'undefined') {
                    etfs[isin].quantity = parseInt(quantity);
                } else {
                    quantity = etfs[isin].quantity;
                }

                if (price) {
                    etfs[isin].price = parseFloat(price);
                }

                etfs[isin].cash = etfs[isin].quantity * etfs[isin].price;

                console.log("-- Set %s(quantity: %s, price: %s)", isin, quantity, price || etfs[isin].price);
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
                    if (etfs[isin] && etfs[isin].quantity) {
                        array.push({
                            isin: etfs[isin].isin,
                            quantity: etfs[isin].quantity,
                            price: etfs[isin].price,
                            cash: etfs[isin].cash,
                        });
                    }
                }

                return array;
            },
            length: function() {
                var i = 0;

                for (var isin in etfs) {
                    if (etfs[isin] && etfs[isin].quantity) {
                        i++;
                    }
                }

                return i;
            },
            cash: function() {
                var cash = 0;

                for (var isin in etfs) {
                    if (etfs[isin]) {
                        cash += etfs[isin].cash;
                    }
                }

                return cash;
            }
        };
    })
    .controller('WizardPortfolioInitController', function($PortfolioFactory, $rootScope, $scope, ngDialog) {
        if (!!$.cookie('client_portfolio_initialized')) {
            $rootScope.showPortfolioSettings = true;

            ngDialog.open({
                template: 'template-client-portfolio-settings',
                closeByEscape: false,
                closeByDocument: false
            });

            $rootScope['active0'] = 'active';

            $rootScope.wizard = {
                step: 0,
                nextButtonLabel: ["Générer un portefeuille", "Ajuster ce portefeuille", "Chargement en cours"],
                goto: function (step) {
                    $rootScope['active' + this.step] = '';
                    $rootScope['active' + (step)] = 'active';

                    switch (step) {
                        case 1:
                            $PortfolioFactory.model($rootScope.client.portfolio.infos.goal, $rootScope.client.portfolio.infos.amountMonthly, $rootScope.client.portfolio.infos.risk, function(err, portfolio) {
                                var etfs = [];

                                for (var i in portfolio) {
                                    var etf = {};

                                    etf[portfolio[0]] = portfolio[1];

                                    etfs.push(etf);
                                }

                                $('#wizard-portfolio-model').attr('filter', JSON.stringify(etfs))
                            });
                            break;

                        case 2:
                            console.log('Ajustement');
                            break;
                    }

                    this.step = step;
                },
                next: function () {
                    this.goto(this.step + 1);
                },
                prev: function () {
                    this.goto(this.step - 1);
                }
            };

            //client.settings.portfolio.save()
        }
    })
    .controller('WizardController', function($ClientFactory, $OrdersFactory, $rootScope, $scope) {
        $scope.$on('$viewContentLoaded', function() {
            // initialize core components
            App.initAjax();
        });

        var current_step = 1;
        var wizard_state = $("#wizard-state");

        $rootScope.wizard_button = function(step) {
            return wizard_state.find("a[data-step=" + step + "]");
        };

        wizard_state.find("a").each(function() {
            $(this).click(function() {
                var active = wizard_state.find('[data-state=current]'),
                current = $(this);

                if (active.attr('data-step') == current.attr('data-step')) {
                    return false;
                }

                if (current.attr('data-step') == 2 && $OrdersFactory.length() == 0) {
                    return false;
                }

                if (wizard_state.find('[data-step=' + (current.attr('data-step') - 1) + ']').attr('data-state') == 'unvalid') {
                    return false;
                }

                console.log("Go to step " + current.attr('data-step'), 'log');

                switch (current.attr('data-step')) {
                    case '1':
                        $OrdersFactory.unlock();
                        $scope.$apply(function() {
                            $('[data-wizard-panel-step=2] [ng-etf-list]').attr('data-filter', '');
                        });
                        break;

                    case '2':
                        $OrdersFactory.lock();
                        $scope.$apply(function() {
                            $('[data-wizard-panel-step=2] [ng-etf-list]')
                                .attr('data-filter', JSON.stringify($OrdersFactory.get()));
                        });
                        break;

                    case '3':
                        $OrdersFactory.lock();
                        setTimeout(function() {
                            $rootScope.runSimulation();
                        }, 500);
                        break;

                    case '4':
                        $OrdersFactory.lock();
                        setTimeout(function() {
                            $rootScope.$apply(function() {
                                $('[data-wizard-panel-step=4] .update-with-etfs-selection')
                                    .attr('data-filter', JSON.stringify($OrdersFactory.get()));
                            });
                        }, 500);
                        break;
                }

                wizard_state.find("a").each(function() {
                    if ($(this).attr('data-step') <= current.attr('data-step')) {
                        $(this).attr('data-state', 'valid');
                    } else {
                        $(this).attr('data-state', 'unvalid');
                    }
                });

                current_step = current.attr('data-step');
                $(this).attr('data-state', 'current');

                $(window).scrollTop(0);

                $('.wizard-panel').hide();
                $('[data-wizard-panel-step=' + current.attr('data-step') + ']').show();
            });

            var step = parseInt($(this).attr('data-step'));

            $('[data-wizard-panel-step=' + step + '] .button').click(function() {
                $rootScope.wizard_button(step + 1).click();
            });
        });

        $('[data-wizard-panel-step=1]').show('slow');

        $rootScope.client = {
            portfolio: {
                infos: {}
            }
        };

        $ClientFactory.portfolio.infos(function(err, infos) {
            if (err) {
                throw err;
            }

            $rootScope.client.portfolio.infos = infos;
        });

    })
    .controller('InvestirController', function($OrdersFactory, $rootScope, $scope, $element) {
        $scope.$OrdersFactory = $OrdersFactory;
        $scope.wizard = {
            map: {
                enabled: false
            }
        };
        $scope.filters = {
            current: {
                category: 'filter-regions',
                value: '',
                question: 'q1',
                anwser: '',
            },
            history: {
                entries: [],
                remove: function(array, from, to) {
                    var rest = array.slice((to || from) + 1 || array.length);
                    array.length = from < 0 ? array.length + from : from;
                    array.push.apply(array, rest)
                    return array.push.apply(array, rest);
                }
            },
            entries: [
                {
                    id: 'filter-sectors',
                    name: 'Je souhaite investir dans un secteur en particulier',
                    items: [
                        {id: 'sector-finance', name: 'Finance'},
                        {id: 'sector-industry', name: 'Industrie'},
                        {id: 'sector-health', name: 'Santé'},
                        {id: 'sector-energy', name: 'Energie'},
                        {id: 'sector-collectivity', name: 'Services aux collectivité'},
                        {id: 'sector-technology', name: 'Technologies de l\'information'},
                        {id: 'sector-consomer', name: 'Biens de consomation cyclique'},
                    ]
                },
                {
                    id: 'filter-regions',
                    name: 'Je souhaite investir dans une région',
                    questions: [
                        {
                            id: "q1",
                            string: "Etes-vous plutôt intéressés par les marchés développés ou émergents ?",
                            anwsers: [
                                {
                                    id: "q1a1",
                                    string: "Marchés développés",
                                    resume: "Je suis intéressé par les marchés développés",
                                    goto: "q2.2"
                                },
                                {
                                    id: "q1a2",
                                    string: "Marchés émergents",
                                    resume: "Je suis intéressé par les marchés émergents",
                                    goto: "q2.1"
                                },
                            ]
                        },
                        {
                            id: "q2.1",
                            string: "Quel continent/sous-continent plus particulièrement ?",
                            anwsers: [
                                {
                                    id: "q2a1",
                                    string: "Afrique",
                                    resume: "Investir en Afrique",
                                    goto: "end"
                                },
                                {
                                    id: "q2a4",
                                    string: "Asia Pacific",
                                    resume: "Investir en Asie Pacifique",
                                    goto: "q4"
                                },
                            ]
                        },
                        {
                            id: "q2.2",
                            string: "Quel continent/sous-continent plus particulièrement ?",
                            anwsers: [
                                {
                                    id: "q2a2",
                                    string: "Europe",
                                    resume: "Investir en Europe",
                                    goto: "q3"
                                },
                                {
                                    id: "q2a3",
                                    string: "Amérique",
                                    resume: "Investir en Amérique",
                                    goto: "end"
                                },
                            ]
                        },
                        {
                            id: "q3",
                            string: "Quel stratégie vous parle le plus, investir sur tende la région, un pays particulier ou un secteur d’activité ?",
                            anwsers: [
                                {
                                    id: "q3a1",
                                    string: "La région",
                                    resume: "Investir sur tende la région",
                                    goto: "end"
                                },
                                {
                                    id: "q3a2",
                                    string: "Un pays",
                                    resume: "Investir dans un pays en particulier",
                                    goto: "end"
                                },
                                {
                                    id: "q3a3",
                                    string: "Un secteur",
                                    resume: "Investir dans un secteur en particulier",
                                    goto: "end"
                                },
                            ]
                        },
                        {
                            id: "q4",
                            string: "Préférez-vous investir sur l'ensemble de la région, ou plutôt sur un pays particulier ?",
                            anwsers: [
                                {
                                    id: "q4a1",
                                    string: "Investir en Australie",
                                    resume: "Investir en Australie",
                                    goto: "end"
                                },
                                {
                                    id: "q4a2",
                                    string: "Investir au Japon",
                                    resume: "Investir au Japon",
                                    goto: "end"
                                },
                                {
                                    id: "q4a3",
                                    string: "Investir sur l'ensemble de la région",
                                    resume: "Investir sur l'ensemble de la région",
                                    goto: "end"
                                },
                            ]
                        },
                        {
                            id: "end",
                            string: "Voici une liste d'ETFs correspondants à vos réponses. Faites votre sélection et passez à l'étape suivante.",
                            button: "Etape suivante",
                            exec: function(history) {
                                var query = [];

                                for(var i in history) {
                                    query.push(history[i][1].id);
                                }

                                console.log(query.join('-'))

                                $rootScope.wizard_button(2).click();
                            }
                        }
                    ]
                },
                {
                    id: 'filter-news',
                    name: 'Investir à partir de l\'actualité',

                },
                {
                    id: 'filter-maps-list',
                    name: 'Je souhaite passer au mode expert',
                },
            ]
        };
    })
    .controller('InvestirMontantAjustementController', function($OrdersFactory, $ClientFactory, $rootScope, $scope, $element) {
        $scope.$OrdersFactory = $OrdersFactory;
    })
    .controller('InvestirRevoirController', function($ClientFactory, $OrdersFactory, $EtfsFactory, $rootScope, $scope) {
        //regroup the invests
        function join_simulation(simulation, simulation_total) {
        	for(var i in simulation) {
        		for(var date in simulation[i]){
        			if(typeof simulation_total[date] == 'undefined') {
        				simulation_total[date] = simulation[i][date];
        			}else {
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

        //Simulation of investments in the portfolio
        function evolution_invests(ref_etfs, data_valo,  done_evolution) {
        	var evolution_etfs = [];
        	var evolution_one_etf = {};
        	var index = 0,
        		n = ref_etfs.length;
        	var prices_concat = [];

        	var prices_callback = function(err, prices) {
        		var value_invest_firstDay = 0;
        		var firstDay = formatDate(data_valo[0][0]);

        		firstDayloop:
        			for (var i = 0, size = prices.length; i < size; i++) {
        				for (var date in prices[i]) {
        					if (date == firstDay) {
        						value_invest_firstDay = ref_etfs[index - 1][1] * prices[i][date];
        						break firstDayloop;
        					}
        				}
        			}

        		for (var i = 0, size = prices.length; i < size; i++) {
        			for (var date in prices[i]) {
        				prices[i][date] *= ref_etfs[index - 1][1];
        				prices[i][date] -= value_invest_firstDay;
        			}
        		}

        		prices_concat = prices_concat.concat(prices);

        		if (index == n) {
        			evolution_one_etf = join_simulation(prices_concat, evolution_one_etf);
        			for(var date in evolution_one_etf) {
        				evolution_etfs.push([new Date(date).getTime(),evolution_one_etf[date]]);
        			}
        			evolution_etfs.sort(function (a, b) {
        				return a[0] - b[0];
        			});

        			done_evolution(evolution_etfs);

        			return;
        		}

                $EtfsFactory.prices(ref_etfs[index++][0], prices_callback);
        	};

            $EtfsFactory.prices(ref_etfs[index++][0], prices_callback);
        }

        //Simulation of investments in the portfolio
        function simulation(ref_etfs, valo, data_valo,  done_simulation) {
        	var simulation_etfs = [];
        	var simul_etfs = {};
        	var index = 0,
        		n = ref_etfs.length;
        	var prices_concat = [];

        	var prices_callback = function(err, prices) {
        		// Get the value of the ETF for each date?????
        		var value_invest_firstDay = 0;
        		var firstDay = formatDate(data_valo[0][0]);

        		firstDayloop:
        		for (var i = 0, size = prices.length; i < size; i++) {
                    for (var date in prices[i]) {
        				if (date == firstDay) {
        					value_invest_firstDay = ref_etfs[index - 1][1] * prices[i][date];
        					break firstDayloop;
        				}
        			}
        		}

        		for (var i = 0, size = prices.length; i < size; i++) {
        			for (var date in prices[i]) {
        				prices[i][date] *= ref_etfs[index - 1][1];
        				prices[i][date] -= value_invest_firstDay;
        			}
        		}

        		prices_concat = prices_concat.concat(prices);

        		if (index == n) {
        			simul_etfs = join_simulation(prices_concat, simul_etfs);
        			for(var date_valo in valo) {
        				for(var date in simul_etfs) {
        					if(date == date_valo){
        						simulation_etfs.push([new Date(date).getTime(),simul_etfs[date] + valo[date_valo]]);
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


        //caculuate the rate of change of etf between tow days
        function rate_change_day(price_d1, price_d2) {
        	return (price_d2 - price_d1) / price_d1;
        }

        //caculuate the moyen of rate of change between one year
        function rate_change_year(prices){
        	var rates = 0;
        	for (var i = 0; i < prices.length - 1 ; i++){
        		if (prices[i] != 0){
        			rates += rate_change_day(prices[i], prices[i + 1]);
        		}
        	}

        	rates = rates / (prices.length - 1);

        	return rates;
        }

        //get the date of next month
        function next_month(date) {
        	var date_1 = new Date(date);
        	var month = date_1.getMonth() + 1;
        	var year = date_1.getFullYear();
        	if (month != 12) {
        		month += 1;
        	}else {
        		year +=  1;
        		month = 1;
        	}
        	var d = date_1.getDate();

        	if (month < 10){
        		return new Date(year + '-0' + month + '-' + d).getTime();
        	} else {
        		return new Date(year + '-' + month + '-' + d).getTime();
        	}
        }

        $ClientFactory.portfolio.valo(function(err, valo, data_valo) {
            if (err) {
                throw err;
            }

            // Trades
            $ClientFactory.portfolio.trades(function(err, trades) {
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

                $rootScope.runSimulation = function() {
                    invest_etfs = [];

                    var orders = $OrdersFactory.get();

                    if (orders.length) {
                        for (var i = 0; i < orders.length; i++) {
                            invest_etfs.push([orders[i].isin, orders[i].quantity]);
                        }

                        simulation(invest_etfs, valo, data_valo, simulation_cb);
                    }
                };

                function simulation_cb(new_invest) {
                    var series = [{      //the value of portfolio
                        name: 'Portefeuille',
                        type: 'spline',
                        data: data_valo,
                        color: 'rgb(243, 156, 18)',
                    }, {        //trades of client
                        name: 'Investissement',
                        data: data_trades,
                        type: 'spline',
                        color: 'rgba(0, 0, 0, .8)',
                        //yAxis: 1,
                        dashStyle: 'longdash'
                    }, {
                        name: 'Nouveaux investissements',
                        data: new_invest,
                        type: 'spline',
                        color: 'rgb(91, 173, 255)'
                    }];

                    //simulation-graph of the past
                    LoadStockChart(series, $('#simulation-past'), true);

                    //Benefice
                    $rootScope.profit = new_invest[new_invest.length - 1][1] - data_valo[data_valo.length - 1][1]
                                            - (new_invest[0][1] - data_valo[0][1]);

                    //simulation-graph of the future
                    var prices_one_year_invests = [];
                    var prices_one_year_wallet = [];
                    var data_valo_future = [];
                    var range_valo_future = [];
                    var data_invest_future = [];
                    var range_invest_future = [];

                    evolution_invests(invest_etfs, data_valo, function(evolution_new_invests) {
                        for (i = evolution_new_invests.length - 1, n = 1; evolution_new_invests.length > 365 ? n < 366 : n <= evolution_new_invests.length; i--, n++) {
                            prices_one_year_invests.push(evolution_new_invests[i][1]);
                        }

                        var rate_average_invest = rate_change_year(prices_one_year_invests) / 12;

                        for (i = data_valo.length - 1, n = 1; data_valo.length > 365 ? n < 366 : n <= data_valo.length; i--, n++) {
                            prices_one_year_wallet.push(data_valo[i][1]);
                        }

                        var rate_average_wallet = rate_change_year(prices_one_year_wallet) / 12;

                        var date_after_two_years = 0;
                        var today = new Date(data_valo[data_valo.length - 1][0]);
                        var year = today.getFullYear() + 2;
                        var month = today.getMonth() + 1;

                        date_after_two_years = year + '-' + month + '-' + today.getDate();

                        var value_wallet = data_valo[data_valo.length - 1][1];
                        var predict_time = data_valo[data_valo.length - 1][0];

                        for (var i = 1; i < 25; i++) {
                            data_valo_future.push([predict_time,value_wallet]);
                            predict_time = next_month(predict_time);
                            value_wallet *= (1 + rate_average_wallet);
                        }
                        data_valo_future.push([predict_time,value_wallet]);

                        for (var i = 0; i < 25; i++) {
                            range_valo_future.push([data_valo_future[i][0],data_valo_future[i][1] * 0.995,
                                data_valo_future[i][1] * 1.005]);
                        }

                        var value_invest = evolution_new_invests[evolution_new_invests.length - 1][1];
                        var value_invest_initial = value_invest;

                        predict_time = data_valo[data_valo.length - 1][0];
                        data_invest_future.push([predict_time, data_valo[data_valo.length - 1][1]]);

                        for (var i = 1; i < 25; i++) {
                            predict_time = next_month(predict_time);
                            value_invest *= (1 + rate_average_invest);
                            data_invest_future.push([predict_time, value_invest - value_invest_initial + data_valo_future[i - 1][1]]);
                        }

                        for (var i = 0; i < 25; i++) {
                            range_invest_future.push([data_invest_future[i][0],data_invest_future[i][1] * 0.995,
                                data_invest_future[i][1] * 1.005]);
                        }

                        //simulation-graph of the future
                        var series = [{
                            name: 'Nouveaux investissements',
                            data: data_invest_future,
                            type: 'spline',
                            color: '#327E00',
                            threshold: null
                        },{
                            name: 'Variation des investissements',
                            data: range_invest_future,
                            type: 'arearange',
                            lineWidth: 0,
                            linkedTo: ':previous',
                            color: '#F9FFF6',
                            fillOpacity: 0.6,
                            zIndex: 1
                        },{
                            name: 'Portefeuille',
                            type: 'spline',
                            data: data_valo_future,
                            color: '#AD6F00',
                            threshold: null
                        },{
                            name: 'Variation des portefeuille',
                            data: range_valo_future,
                            type: 'arearange',
                            lineWidth: 0,
                            linkedTo: ':previous',
                            color: '#FFFDF4',
                            fillOpacity: 0.6,
                            zIndex: 0
                        }];

                        LoadStockChart(series, $('#simulation-future'), true);
                    });
                }
            });
        });
    })
    .controller('InvestirValidationController', function($OrdersFactory, $scope) {
        $scope.$OrdersFactory = $OrdersFactory;
    });