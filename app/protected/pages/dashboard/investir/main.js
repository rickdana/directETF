angular.module('MetronicApp')
    .factory('$OrdersFactory', function () {
        var etfs = {};
        var locked = false;

        return {
            lock: function () {
                locked = true;
            },
            unlock: function () {
                locked = false;
            },
            set: function (isin, quantity, price) {
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
            get: function (isin) {
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
            length: function () {
                var i = 0;

                for (var isin in etfs) {
                    if (etfs[isin] && etfs[isin].quantity) {
                        i++;
                    }
                }

                return i;
            },
            cash: function () {
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
    .controller('WizardPortfolioInitController', function ($PortfolioFactory, $rootScope, $scope, ngDialog) {
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
                            $PortfolioFactory.model($rootScope.client.portfolio.infos.goal, $rootScope.client.portfolio.infos.amountMonthly, $rootScope.client.portfolio.infos.risk, function (err, portfolio) {
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
    .controller('WizardController', function ($ClientFactory, $OrdersFactory, $rootScope, $scope) {
        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();
        });

        var current_step = 1;
        var wizard_state = $("#wizard-state");

<<<<<<< HEAD
        $rootScope.wizard_button = function (step) {
=======
        $rootScope.wizard = {
            step: 1
        };

        $rootScope.wizard_button = function(step) {
>>>>>>> 18c9edd... Add aCheck and improve the first step of page Investir by adding a survey
            return wizard_state.find("a[data-step=" + step + "]");
        };

        wizard_state.find("a").each(function () {
            $(this).click(function () {
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
                        $scope.$apply(function () {
                            $('[data-wizard-panel-step=2] [ng-etf-list]')
                                .attr('data-filter', JSON.stringify($OrdersFactory.get()));
                        });
                        break;

                    case '3':
                        $OrdersFactory.lock();
                        setTimeout(function () {
                            $rootScope.runSimulation();
                        }, 500);
                        break;

                    case '4':
                        $OrdersFactory.lock();
                        setTimeout(function () {
                            $rootScope.$apply(function () {
                                $('[data-wizard-panel-step=4] .update-with-etfs-selection')
                                    .attr('data-filter', JSON.stringify($OrdersFactory.get()));
                            });
                        }, 500);
                        break;
                }

                wizard_state.find("a").each(function () {
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

            $('[data-wizard-panel-step=' + step + '] .button').click(function () {
                $rootScope.wizard_button(step + 1).click();
            });
        });

        $('[data-wizard-panel-step=1]').show('slow');

<<<<<<< HEAD
        $ClientFactory.portfolio.infos(function (err, infos) {
=======
        $rootScope.client = {
            portfolio: {
                infos: {}
            }
        };

        $ClientFactory.portfolio.infos(function(err, infos) {
>>>>>>> 18c9edd... Add aCheck and improve the first step of page Investir by adding a survey
            if (err) {
                throw err;
            }

            $rootScope.client.portfolio.infos = infos;
        });

    })
<<<<<<< HEAD
    .controller('InvestirController', function ($OrdersFactory, $rootScope, $scope, $element) {
        // TODO Configuration à partir du portefeuille: affichier le cash disponible et définir le montant à investir
        // TODO Permettre l'ajustement (quantité et prix) des ordres d'investissement

        $scope.cbEtfsListLoaded = function (etfs) {
            for (var i = 0; i < etfs.length; i++) {
                // Checkbox init
                $element.find('[data-isin=' + etfs[i].isin + '] [type=checkbox]').each((function (etf) {
                    return function () {
                        $(this).iCheck({checkboxClass: 'icheckbox_square-blue'});

                        $(this).on('ifChecked', function () {
                            $OrdersFactory.set(etf.isin, 3, etf.price);
                        });

                        $(this).on('ifUnchecked', function () {
                            $OrdersFactory.set(etf.isin, 0);
                        });
                    };
                })(etfs[i]));

                $scope.$apply(function () {
                    $scope.$watch(function () {
                        return $OrdersFactory.length();
                    }, function (length) {
                        $element.find('[type=checkbox]').each(function (event) {
                            $(this).iCheck('uncheck');
                        });

                        var selection = $OrdersFactory.get();

                        for (var i = 0; i < selection.length; i++) {
                            if (selection[i].quantity) {
                                $element.find('[data-isin=' + selection[i].isin + '] [type=checkbox]').iCheck('check');
                            }
                        }
                    });
                });
            }

//            return;

            var wizard_panel_1 = $('[data-wizard-panel-step=1]'),
                wizard_panel_1_table = wizard_panel_1.find('table').first(),
                wizard_panel_1_list = wizard_panel_1_table.find("tbody");

            var wizard_panel_2 = $('[data-wizard-panel-step=2]'),
                wizard_panel_2_table = wizard_panel_2.find('table').first(),
                wizard_panel_2_list = wizard_panel_2_table.find('tbody'),
                wizard_panel_2_action = wizard_panel_2.find('.etf-action-dropdown').first().hide();

            var wizard_panel_3 = $('[data-wizard-panel-step=3]'),
                wizard_panel_3_table = wizard_panel_3.find('table#summary-table'),
                wizard_panel_3_list = wizard_panel_3_table.find("tbody");

            //      var oTable = wizard_panel_1_table.dataTable({
            //          bFilter: !false,
            //          bInfo: wizard_panel_1_list.find('tr').length > 20,
            //          paging: wizard_panel_1_list.find('tr').length > 20,
            //          lengthChange: false,
            //          searching: !false,
            //          ordering: true,
            //          info: true,
            //          autoWidth: false,
            //          columnDefs: [
            //              { searchable: false, targets: 5 }
            //          ],
            //          order: [0, "asc"]
            //      });

            $(".dataTables_filter").hide();

            //      $.AdminLTE.tree('#filters-container');

            var filters = {};

            clear_search = function () {
                oTable.fnResetAllFilters();
                $('#filters-container a.filter').attr('data-selected', 'false');
                console.log('clear')
            };
            start_search = function (q, c, callback) {
                if (typeof c == 'undefined') {
                    oTable.fnFilter(q.replace(/,/g, '|'), null, true, false, true, true);
                } else {
                    if (typeof filters[c] == 'undefined') {
                        filters[c] = q.trim();
                    } else if (filters[c].length > 0) {
                        if (filters[c].search(q) >= 0) {
                            return;
                        }
                        filters[c] = filters[c] + '|' + q.trim();
                    }

                    oTable.fnFilter(filters[c], c, true, false, true, true);

                    console.log('Queries:')
                    for (var i in filters) {
                        console.log('\t[%s]: %s', i, filters[i]);
                    }
                }
            };

            var filters_container = $('#filters-container')
                , filter_searchbar = filters_container.find('#filters-searchbar')
                , search_input = $('#search-etf')
                , sidebar_menu = filters_container.find('.sidebar-menu');

            search_input.tagsinput();

            var sidebar_menu_position = function () {
                console.log(filter_searchbar.outerHeight())
                sidebar_menu.css('margin-top', filter_searchbar.outerHeight() + 'px');
            };

            filters_container.css({
                height: 'initial',
                opacity: '1'
            });

            var search_input_keyup_click_handle = function (o, value, code) {
                    //$('#out')[0].textContent = `${e.type}: ${this.value.replace(/,/g,', ')}`;
                    //console.log(this.value.replace(/,/g,', '));

                    var prev = tag = o.getAttribute('data-previous-tags')
                        , column = o.getAttribute('data-type');

                    if (typeof prev == 'string') {
                        tag = value.substr(prev.length);
                        console.log(prev)
                        console.log(tag)
                    } else {
                        tag = value;
                    }

                    if (typeof column == 'string') {
                        start_search(tag, column == 'sector' ? 1 : 2);

                        o.setAttribute('data-previous-tags', value);
                    } else {
                        start_search(tag);
                    }
                },
                search_input_change_handle = function (e) {
                    sidebar_menu_position();

                    var keys = search_input.tagsinput('items');

                    clear_search();
                    $('#filters-container a.filter').attr('data-selected', 'false');

                    if (keys.length > 0) {
                        for (var i in keys) {
                            var filter = $('.filter[data-value*="' + keys[i] + '"]').attr('data-selected', 'true');

                            start_search(keys[i],
                                filter.attr('data-type') == 'sector'
                                    ? 1
                                    : filter.attr('data-type') == 'region'
                                    ? 2
                                    : 0);
                        }
                    }

                    sidebar_menu_position();
                }

            var search_key = ''
                , search_keys = '';

            function filterbar_add_key(key, code) {
                var pos = search_keys.search(key);

                key = key.toLowerCase();

                if (pos == -1) {
                    search_input.tagsinput('add', code);
                } else {
                    search_input.tagsinput('remove', code);
                }
            }

            filter_searchbar.on('click', search_input_change_handle);

            filter_searchbar.find('input').each(function () {
                $(this).on('keyup', function (e) {
                    if (e.keyCode == 13 || e.keyCode == 188) {
                        filterbar_add_key(search_key, search_key);
                        search_input_keyup_click_handle(this, search_key, search_key, search_key);
                    } else {
                        sidebar_menu_position();
                    }

                    search_key = $(this).val().trim();
                })
                    .on('change', function (e) {
                        console.log('search_input_change_handle:change')
                        search_input_change_handle();
                        search_input_keyup_click_handle(this, search_key, search_key, search_key);
                    });
            });

            $('#filters-container a.filter').each(function () {
                $(this).on('click', function () {
                    var value = $(this).attr('data-value').toLowerCase()
                        , code = $(this).text().trim();

                    filterbar_add_key(value, code);
                    search_input_keyup_click_handle($(this).get(0), value, code);
                });
            });
        };
    })
    .controller('InvestirMontantAjustementController', function ($OrdersFactory, $ClientFactory, $rootScope, $scope, $element) {
        $scope.cbEtfsListBeforeRendering = function (etfs, done) {
            for (var i = 0; i < etfs.length; i++) {
                etfs[i].cash = etfs[i].quantity * etfs[i].price;
=======
    .controller('InvestirController', function($OrdersFactory, $rootScope, $scope, $element) {
        $scope.$OrdersFactory = $OrdersFactory;
        $scope.wizard = {
            map: {
                enabled: false
>>>>>>> 18c9edd... Add aCheck and improve the first step of page Investir by adding a survey
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

<<<<<<< HEAD
        /**
         TODO Bug: step1: sélectioner les 3 premiers etfs. step2: désélectionner les 3 etfs. step1: resélectionner les
         3 premiers etfs. step2-bug: les 3 etfs sélectionnés sont chargés dans le tableau, mais la valeur de leur
         n'est pas reinitialisée
         */
        $scope.cbEtfsListLoaded = function (etfs) {
            $scope.$apply(function () {
                $scope.$watch(function () {
                    return $OrdersFactory.cash();
                }, function (cash) {
                    $rootScope.cash = cash;

                    if (cash == 0) {
                        $rootScope.wizard_button(1).click();
                    }
                });
            });

            // Checkbox init
            $element.find('input[type=checkbox]').each(function () {
                var row = $(this).parent().parent()
                    , isin = row.attr('data-isin')
                    , quantity = parseInt(row.find('.quantity').first().text());

                $(this).iCheck({
                    checkboxClass: 'icheckbox_square-blue',
                    increaseArea: '20%'
                });

                $(this).on('ifChecked', function () {
                    row.css('text-decoration', 'none');

                    $scope.$apply(function () {
                        $OrdersFactory.unlock();
                        $OrdersFactory.set(isin, quantity);
                        $OrdersFactory.lock();
=======
                                console.log(query.join('-'))
>>>>>>> 18c9edd... Add aCheck and improve the first step of page Investir by adding a survey

                                $rootScope.wizard.step = 2;
                            }
                        }
<<<<<<< HEAD
                    });
                });

                $(this).on('ifUnchecked', function () {
                    row.css('text-decoration', 'line-through');

                    $scope.$apply(function () {
                        $OrdersFactory.unlock();
                        $OrdersFactory.set(isin, 0);
                        $OrdersFactory.lock();
=======
                    ]
                },
                {
                    id: 'filter-news',
                    name: 'Investir à partir de l\'actualité',
>>>>>>> 18c9edd... Add aCheck and improve the first step of page Investir by adding a survey

                },
                {
                    id: 'filter-maps-list',
                    name: 'Je souhaite passer au mode expert',
                },
            ]
        };
    })
<<<<<<< HEAD
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

=======
    .controller('InvestirMontantAjustementController', function($OrdersFactory, $ClientFactory, $rootScope, $scope, $element) {
        $scope.$OrdersFactory = $OrdersFactory;
    })
    .controller('InvestirRevoirController', function($ClientFactory, $OrdersFactory, $EtfsFactory, $rootScope, $scope) {
>>>>>>> 18c9edd... Add aCheck and improve the first step of page Investir by adding a survey
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
<<<<<<< HEAD
    .controller('InvestirValidationController', function ($scope, $element) {
=======
    .controller('InvestirValidationController', function($OrdersFactory, $scope) {
        $scope.$OrdersFactory = $OrdersFactory;
>>>>>>> 18c9edd... Add aCheck and improve the first step of page Investir by adding a survey
    });