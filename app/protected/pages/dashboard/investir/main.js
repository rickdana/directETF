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
            set: function(etf, quantity, price) {
                if (locked) {
                    return;
                }
                if (!etfs[etf.isin]) {
                    if (!etfs[etf.isin]) {
                        etfs[etf.isin] = etf;
                        quantities[etf.isin] = etf.quantity;
                    }
                    return console.log("-> %s(quantity: %s, price: %s) was added in the selection list", etf.isin, quantity, price);
                }

                if (typeof quantity != 'undefined') {
                    quantities[etf.isin] = parseInt(quantity);
                } else {
                    quantity = etfs[etf.isin].quantity;
                }

                if (price) {
                    etfs[etf.isin].price = parseFloat(price);
                }

                console.log("-- Set %s(quantity: %s, price: %s)", etf.isin, quantity, price || etfs[etf.isin].price);
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
                    if (etfs[isin] && quantities[isin]) {
                        i++;
                    }
                }

                return i;
            },
            cash: function() {
                var cash = 0;

                for (var isin in etfs) {
                    if (etfs[isin]) {
                        cash += quantities[isin] * etfs[isin].price;
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
    .controller('WizardController', function($ClientFactory, $OrdersFactory, $rootScope, $scope, $element) {
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
                            $rootScope.runSimulation();
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
        var _invest_etfs = null;
        var _ref_etfs = null;
        var _data_valo = null;

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

        ////Simulation future
        //function simulation_future(time_frame, data_valo_today, data) {
        //    var simulation_future_etfs = [];
        //    var value_invest_today = data_valo_today[1];
        //    var firstDay = formatDate(data_valo_today[0]);
        //
        //    var taux = rate_change_year(data);
        //    var montant = value_invest_today;
        //    var month = firstDay;
        //    simulation_future_etfs.push([new Date(firstDay).getTime(), montant]);
        //    for (var i = 0; i < time_frame; i++) {
        //        for (var j = 1; j <= 12; j++) {
        //            month = next_month(month);
        //            simulation_future_etfs.push([new Date(month).getTime(), montant * (taux / 12 * j + 1)]);
        //        }
        //        montant *= (1 + taux);
        //    }
        //
        //    return simulation_future_etfs;
        //}

        //function draw_simulation_future(data_valo, invest_simu_past) {
        //    //simulation-graph of the future
        //    var range_valo_future = [];
        //    var range_invest_future = [];
        //    var time_frame = $scope.timeframe;
        //    var montant_today = data_valo[data_valo.length - 1];
        //
        //    var data_invest_future = simulation_future(time_frame, montant_today, invest_simu_past);
        //    var data_valo_future = simulation_future(time_frame, montant_today, data_valo);
        //
        //    var data_invest_future_varia = [];
        //    for (var i = 0; i < data_invest_future.length; i++) {
        //        data_invest_future_varia.push([data_invest_future[i][0], data_invest_future[i][1] * 0.8, data_invest_future[i][1]]);
        //    }
        //
        //    //simulation-graph of the future
        //    var series = [{
        //        name: 'Portefeuille',
        //        type: 'spline',
        //        data: data_valo_future,
        //        color: 'rgb(243, 156, 18)',
        //        threshold: null,
        //        zIndex: 10,
        //        visible: false
        //    }, {
        //        name: 'Nouveaux investissements',
        //        type: 'arearange',
        //        data: data_invest_future_varia,
        //        color: '#00802b',
        //        threshold: null
        //    }];
        //
        //    LoadStockChart(series, $('#simulation-future'), true);
        //}

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
                data_simu_future.push([new Date(date).getTime(), simulation_future_etfs_moins_vola[date], simulation_future_etfs_ajoute_vola[date]]);
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
            var data_valo_future_attendu = simulation_future(ref_etfs, time_frame, data_valo_today, -1, 1);
            var data_valo_future_favorable = simulation_future(ref_etfs, time_frame, data_valo_today, 1, 2);
            var data_valo_future_defavorable = simulation_future(ref_etfs, time_frame, data_valo_today, -2, -1);


            //simulation-graph of the future
            var series = [{
                name: 'Portefeuille - 68%',
                id: 'Portefeuille_1',
                type: 'arearange',
                data: data_valo_future_attendu,
                color: 'rgb(243, 156, 18)',
                threshold: null,
                zIndex: 10,
                visible: false,
                showCheckbox: true,
                showInLegend: false

            }, {
                name: 'Prévision - 68%',
                id: 'Prévision_1',
                type: 'arearange',
                data: data_invest_future_attendu,
                color: 'rgb(43, 161, 76)',
                zIndex: 11,
                threshold: null,
                showCheckbox: true,
                showInLegend: false
            }, {
                name: 'Prévision - favorable 13%',
                id: 'Prévision_2',
                type: 'arearange',
                data: data_invest_future_favorable,
                color: 'rgb(130, 208, 151)',
                zIndex: 11,
                threshold: null,
                showInLegend: false
            }, {
                name: 'Prévision - defavorable 13%',
                id: 'Prévision_3',
                type: 'arearange',
                data: data_invest_future_defavorable,
                color: 'rgb(140, 140, 140)',
                zIndex: 11,
                threshold: null,
                showInLegend: false
            },{
                name: 'Portefeuille - favorable 13%',
                id: 'Portefeuille_2',
                type: 'arearange',
                data: data_valo_future_favorable,
                color: 'rgb(255, 204, 102)',
                threshold: null,
                zIndex: 10,
                visible: false,
                showInLegend: false
            },{
                name: 'Portefeuille - défavorable 13%',
                id: 'Portefeuille_3',
                type: 'arearange',
                data: data_valo_future_defavorable,
                color: 'rgb(140, 140, 140)',
                threshold: null,
                zIndex: 10,
                visible: false,
                showInLegend: false
            }];

            LoadStockChart(series, $('#simulation-future'), true);

            var radio_investissement = document.getElementById("radio-investissements");
            var radio_portefueille = document.getElementById("radio-portefeuille");
            var chart_future = $('#simulation-future').highcharts();
            var first = true;

            $(radio_investissement).change(function() {
                if (this.checked) {
                    chart_future.get('Prévision_1').setVisible(true, false);
                    chart_future.get('Prévision_2').setVisible(true, false);
                    chart_future.get('Prévision_3').setVisible(true, false);
                    chart_future.get('Portefeuille_1').setVisible(false, false);
                    chart_future.get('Portefeuille_2').setVisible(false, false);
                    chart_future.get('Portefeuille_3').setVisible(false, false);
                }
            });


            $(radio_portefueille).change(function() {
                if (this.checked) {
                    chart_future.get('Portefeuille_1').setVisible(true, first);
                    chart_future.get('Portefeuille_2').setVisible(true, first);
                    chart_future.get('Portefeuille_3').setVisible(true, first);
                    chart_future.get('Prévision_1').setVisible(false, false);
                    chart_future.get('Prévision_2').setVisible(false, false);
                    chart_future.get('Prévision_3').setVisible(false, false);
                    first = false;
                }
            });
            //$('#simulation-future').highcharts().legend.allItems[1].update({name:'Prévision avec nouveaux investissements'});
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

                    //draw_simulation_future(data_valo, invest_simu_past);
                    //
                    //_invest_simu_past = invest_simu_past;
                    //_data_valo = data_valo;
                }

            });
        });

        [
            {"profitability":0.015,"sectors":[{"Finance":100}],"name":"Lyxor MSCI World UCITS ETF","description":"","countries":[{"US":100}],"volatility":1.46,"isin":"FR0010315770","countriesStr":"US","sectorsStr":"Finance","price":14.06,"$$hashKey":"object:107","quantity":1,"enabled":true},
            {"profitability":0.01,"sectors":[{"Industrie":100}],"name":"Lyxor MSCI USA","description":"","countries":[{"US":100}],"volatility":37.64,"isin":"QS0011029939","countriesStr":"US","sectorsStr":"Industrie","price":191.92,"$$hashKey":"object:219","quantity":1,"enabled":true},
            {"profitability":0.003,"sectors":[{"Technologies de l'information":100}],"name":"Lyxor Smart Cash - UCITS ETF C-EUR","description":"","countries":[{"FR":100}],"volatility":0.29,"isin":"LU1190417599","countriesStr":"FR","sectorsStr":"Technologies de l'information","price":125,"$$hashKey":"object:225","quantity":1,"enabled":true},
            {"profitability":0.01,"sectors":[{"Technologies de l'information":100}],"name":"Lyxor MSCI USA UCITS ETF","description":"","countries":[{"US":100}],"volatility":0.2,"isin":"FR0010296061","countriesStr":"US","sectorsStr":"Technologies de l'information","price":334.73,"$$hashKey":"object:237","quantity":1,"enabled":true},
            {"profitability":0.002,"sectors":[{"Finance":100}],"name":"Lyxor EURO STOXX 50 CHF Daily Hedged UCITS ETF","description":"","countries":[{"FR":100}],"volatility":0.3,"isin":"FR0012399731","countriesStr":"FR","sectorsStr":"Finance","price":60.59,"$$hashKey":"object:251","quantity":1,"enabled":true}
        ].forEach(function(etf) {
                $OrdersFactory.set(etf);
            });

        setTimeout(function() {
            $scope.wizard.goto(3);
        }, 500)


    })
    .controller('InvestirValidationController', function($OrdersFactory, $scope) {
        $scope.$OrdersFactory = $OrdersFactory;
    });

