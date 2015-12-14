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
    .controller('WizardPortfolioInitController', function($PortfolioFactory, $scope, ngDialog) {
        if (!!$.cookie('client_portfolio_initialized')) {
            $scope.showPortfolioSettings = true;

            ngDialog.open({
                template: 'template-client-portfolio-settings',
                closeByEscape: false,
                closeByDocument: false
            });

            $scope['active0'] = 'active';

            $scope.wizard = {
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
    .controller('WizardController', function($ClientFactory, $OrdersFactory, $scope, $element) {
        $scope.$on('$viewContentLoaded', function() {
            // initialize core components
            App.initAjax();
        });

        var wizard_state = $("#wizard-state");

        $scope.wizard = {
            step: 1,
            goto: function(step) {
                var active = $element.find('[data-step=' + this.step + ']'),
                    current = $element.find('[data-step=' + step + ']');

                if (active.attr('data-step') == current.attr('data-step')) {
                    return false;
                }

                if (current.attr('data-step') == 2 && $OrdersFactory.length() == 0) {
                    return false;
                }

                if (wizard_state.find('[data-step=' + (current.attr('data-step') - 1) + ']').attr('data-state') == 'unvalid') {
                    return false;
                }

                this.step = step;

                console.log("Go to step " + current.attr('data-step'));

                switch (current.attr('data-step')) {
                    case '1':
                        $OrdersFactory.unlock();
                        $element.find('[data-step=2] [ng-etf-list]').attr('data-filter', '');
                        break;

                    case '2':
                        $OrdersFactory.lock();
                        $element.find('[data-step=2] [ng-etf-list]')
                            .attr('data-filter', JSON.stringify($OrdersFactory.get()));
                        break;

                    case '3':
                        $OrdersFactory.lock();
                        setTimeout(function() {
                            $scope.runSimulation();
                        }, 500);
                        break;

                    case '4':
                        $OrdersFactory.lock();
                        setTimeout(function() {
                            $scope.$apply(function() {
                                $element.find('[data-step=4] .update-with-etfs-selection')
                                    .attr('data-filter', JSON.stringify($OrdersFactory.get()));
                            });
                        }, 500);
                        break;
                }

                document.body.scrollTop = 0;
            }
        };

        $scope.client = {
            portfolio: {
                infos: {}
            }
        };

        $ClientFactory.portfolio.infos(function(err, infos) {
            if (err) {
                throw err;
            }

            $scope.client.portfolio.infos = infos;
        });

    })
    .controller('InvestirController', function($OrdersFactory, $rootScope, $scope) {
        $scope.$OrdersFactory = $OrdersFactory;

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

                                $scope.wizard.goto(2);
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
    .controller('InvestirMontantAjustementController', function($OrdersFactory, $ClientFactory, $rootScope, $scope) {
        $scope.$OrdersFactory = $OrdersFactory;
    })
    .controller('InvestirRevoirController', function ($ClientFactory, $OrdersFactory, $EtfsFactory, $rootScope, $scope, $element) {
        var _invest_simu_past = null;
        var _data_valo = null;

        $scope.timeframe = 3;

        $scope.sliderTimeframe = {
            options: {
                floor: 3,
                ceil: 50,
                showSelectionBar: true,
                hideLimitLabels: true,
                onEnd: function () {
                    draw_simulation_future(_data_valo, _invest_simu_past);
                },
                translate: function() {
                    return '';
                }
            }
        };

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
            var montant = $OrdersFactory.cash();

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
        function simulation_future(time_frame, data_valo_today, data) {
            var simulation_future_etfs = [];
            var value_invest_today = data_valo_today[1];
            var firstDay = formatDate(data_valo_today[0]);

            var taux = rate_change_year(data);
            var montant = value_invest_today;
            var month = firstDay;
            simulation_future_etfs.push([new Date(firstDay).getTime(), montant]);
            for (var i = 0; i < time_frame; i++) {
                for (var j = 1; j <= 12; j++) {
                    month = next_month(month);
                    simulation_future_etfs.push([new Date(month).getTime(), montant * (taux / 12 * j + 1)]);
                }
                montant *= (1 + taux);
            }

            return simulation_future_etfs;
        }

        function draw_simulation_future(data_valo, invest_simu_past) {
            //simulation-graph of the future
            var range_valo_future = [];
            var range_invest_future = [];
            var time_frame = $scope.timeframe;
            var montant_today = data_valo[data_valo.length - 1];

            var data_invest_future = simulation_future(time_frame, montant_today, invest_simu_past);
            var data_valo_future = simulation_future(time_frame, montant_today, data_valo);

            var data_invest_future_varia = [];
            for (var i = 0; i < data_invest_future.length; i++) {
                data_invest_future_varia.push([data_invest_future[i][0], data_invest_future[i][1] * 0.8, data_invest_future[i][1]]);
            }

            //simulation-graph of the future
            var series = [{
                name: 'Portefeuille',
                type: 'spline',
                data: data_valo_future,
                color: 'rgb(243, 156, 18)',
                threshold: null,
                zIndex: 10,
                visible: false
            }, {
                name: 'Nouveaux investissements',
                type: 'arearange',
                data: data_invest_future_varia,
                color: '#00802b',
                threshold: null
            }];

            LoadStockChart(series, $('#simulation-future'), true);
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
                return new Date(year + '-0' + month + '-01').getTime();
            } else {
                return new Date(year + '-' + month + '-01').getTime();
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

                $rootScope.runSimulation = function () {
                    invest_etfs = [];

                    var orders = $OrdersFactory.get();

                    if (orders.length) {
                        for (var i = 0; i < orders.length; i++) {
                            invest_etfs.push([orders[i].isin, orders[i].quantity, orders[i].price, orders[i].cash]);
                        }

                        simulation_past(invest_etfs, valo, data_valo, simulation_cb);
                    }
                };

                function simulation_cb(invest_simu_past) {
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
                        data: invest_simu_past,
                        type: 'spline',
                        color: 'rgb(91, 173, 255)'
                    }];


                    //simulation-graph of the past
                    LoadStockChart(series, $('#simulation-past'), true);

                    //Benefice
                    $rootScope.profit = invest_simu_past[invest_simu_past.length - 1][1] - data_valo[data_valo.length - 1][1]
                        - (invest_simu_past[0][1] - data_valo[0][1]);

                    draw_simulation_future(data_valo, invest_simu_past);

                    _invest_simu_past = invest_simu_past;
                    _data_valo = data_valo;
                }

            });
        });
    })
    .controller('InvestirValidationController', function($OrdersFactory, $scope) {
        $scope.$OrdersFactory = $OrdersFactory;
    });