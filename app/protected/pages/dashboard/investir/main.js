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
                        throw new Error('Quantity of %s must be set!', isin);
                    }
                    if (typeof price == 'undefined') {
                        throw new Error('Price of %s must be set!', isin);
                    }

                    if (!etfs[isin]) {
                        etfs[isin] = {
                            isin: isin,
                            quantity: quantity,
                            limit: quantity,
                            price: price,
                            priceLimit: price
                        };
                    }
                    return console.log("-> %s was added in the selection list", isin);
                }

                if (typeof quantity != 'undefined') {
                    quantity = parseInt(quantity);

                    if (quantity > etfs[isin].limit) {
                        throw new Error('Quantity of ' + isin + ' must be less than ' + etfs[isin].limit + '! #' + quantity);
                    }

                    etfs[isin].quantity = quantity;
                } else {
                    quantity = etfs[isin].limit;
                }

                if (price) {
                    price = parseFloat(price);

                    if (price > etfs[isin].priceLimit) {
                        throw new Error('Price of ' + isin + ' must be less than ' + etfs[isin].priceLimit + '! %' + price);
                    }

                    etfs[isin].price = price;
                }

                console.log("-- Set %s(quantity: %s, price: %s)", isin, quantity, price || etfs[isin].priceLimit);
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
                        cash += etfs[isin].quantity * etfs[isin].price;
                    }
                }

                return cash;
            }
        };
    })
    .controller('WizardController', function($ClientFactory, $OrdersFactory, $rootScope, $scope, $element) {
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

        $ClientFactory.portofolio(function(portofolio) {
            $rootScope.client = {
                portofolio: portofolio
            };

            var catch_max = $('#catch-max');

            catch_max.ionRangeSlider({
                min: catch_max.attr('data-min'),
                max: portofolio.cash,
                from: portofolio.cash,
                postfix: catch_max.attr('data-postfix'),
                //            grid: true,
                hide_min_max: true,
                grid_num: 10
            });
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;
    })
    .controller('InvestirController', function($OrdersFactory, $rootScope, $scope, $element) {
        // TODO Configuration à partir du portefeuille: affichier le cash disponible et définir le montant à investir
        // TODO Permettre l'ajustement (quantité et prix) des ordres d'investissement

        $scope.cbEtfsListLoaded = function(etfs) {
            for (var i = 0; i < etfs.length; i++) {
                // Checkbox init
                $element.find('[data-isin=' + etfs[i].isin + '] [type=checkbox]').each((function(etf) {
                    return function() {
                        $(this).iCheck({ checkboxClass: 'icheckbox_square-blue' });

                        $(this).on('ifChecked', function() {
                            $OrdersFactory.set(etf.isin, etf.quantity, etf.price);
                        });

                        $(this).on('ifUnchecked', function() {
                            $OrdersFactory.set(etf.isin, 0);
                        });
                    };
                })(etfs[i]));

                $scope.$apply(function() {
                    $scope.$watch(function() {
                        return $OrdersFactory.length();
                    }, function(length) {
                        $element.find('[type=checkbox]').each(function(event) {
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

              clear_search = function() {
                  oTable.fnResetAllFilters();
                  $('#filters-container a.filter').attr('data-selected', 'false');
                  console.log('clear')
              };
              start_search = function(q, c, callback) {
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

              var sidebar_menu_position = function() {
                      console.log(filter_searchbar.outerHeight())
                      sidebar_menu.css('margin-top', filter_searchbar.outerHeight() + 'px');
                  };

              filters_container.css({
                  height: 'initial',
                  opacity: '1'
              });

              var search_input_keyup_click_handle = function(o, value, code) {
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
                  search_input_change_handle = function(e) {
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

              filter_searchbar.find('input').each(function() {
                  $(this).on('keyup', function(e) {
                              if (e.keyCode == 13 || e.keyCode == 188) {
                                  filterbar_add_key(search_key, search_key);
                                  search_input_keyup_click_handle(this, search_key, search_key, search_key);
                              } else {
                                  sidebar_menu_position();
                              }

                              search_key = $(this).val().trim();
                          })
                          .on('change', function(e) {
                              console.log('search_input_change_handle:change')
                              search_input_change_handle();
                              search_input_keyup_click_handle(this, search_key, search_key, search_key);
                          });
              });

              $('#filters-container a.filter').each(function() {
                  $(this).on('click', function() {
                      var value = $(this).attr('data-value').toLowerCase()
                        , code = $(this).text().trim();

                      filterbar_add_key(value, code);
                      search_input_keyup_click_handle($(this).get(0), value, code);
                  });
              });
        };
    })
    .controller('InvestirMontantAjustementController', function($OrdersFactory, $ClientFactory, $rootScope, $scope, $element) {
        /**
         TODO Bug: step1: sélectioner les 3 premiers etfs. step2: désélectionner les 3 etfs. step1: resélectionner les
         3 premiers etfs. step2-bug: les 3 etfs sélectionnés sont chargés dans le tableau, mais la valeur de leur
         n'est pas reinitialisée
        */
        $scope.cbEtfsListLoaded = function(etfs) {
            $scope.$apply(function() {
                $scope.$watch(function() {
                    return $OrdersFactory.cash();
                }, function(cash) {
                    $rootScope.cash = cash;

                    if (cash == 0) {
                        $rootScope.wizard_button(1).click();
                    }
                });
            });

            // Checkbox init
            $element.find('input[type=checkbox]').each(function() {
                var row = $(this).parent().parent()
                  , isin = row.attr('data-isin')
                  , quantity = parseInt(row.find('.quantity').first().text());

                $(this).iCheck({
                    checkboxClass: 'icheckbox_square-blue',
                    increaseArea: '20%'
                });

                $(this).on('ifChecked', function() {
                    row.css('text-decoration', 'none');

                    $scope.$apply(function() {
                        $OrdersFactory.unlock();
                        $OrdersFactory.set(isin, quantity);
                        $OrdersFactory.lock();

                        for (var i = 0; i < $scope.etfs.length; i++) {
                            if ($scope.etfs[i].isin == isin) {
                                $scope.etfs[i].quantity = quantity;
                                break;
                            }
                        }
                    });
                });

                $(this).on('ifUnchecked', function() {
                    row.css('text-decoration', 'line-through');

                    $scope.$apply(function() {
                        $OrdersFactory.unlock();
                        $OrdersFactory.set(isin, 0);
                        $OrdersFactory.lock();

                        for (var i = 0; i < $scope.etfs.length; i++) {
                            if ($scope.etfs[i].isin == isin) {
                                $scope.etfs[i].quantity = 0;
                                break;
                            }
                        }
                    });
                });
            });
        };
    })
    .controller('InvestirRevoirController', function($ClientFactory, $OrdersFactory, $rootScope, $scope, $element) {
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

        //return the l'historique de prix de ETF
        function etf_price(ref_isin, done) {
        	$.getJSON(WS_URL + '/etf/prices/' + ref_isin, function (prices) {
        		done(prices);
        	});
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

        //Simulation of investments in the portofolio
        function evolution_invests(ref_etfs, data_valo,  done_evolution) {
        	var evolution_etfs = [];
        	var evolution_one_etf = {};
        	var index = 0,
        		n = ref_etfs.length;
        	var prices_concat = [];

        	var prices_callback = function(prices) {
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

        		etf_price(ref_etfs[index++][0], prices_callback);
        	};


        	etf_price(ref_etfs[index++][0], prices_callback);
        }

        //Simulation of investments in the portofolio
        function simulation(ref_etfs, valo, data_valo,  done_simulation) {
        	var simulation_etfs = [];
        	var simul_etfs = {};
        	var index = 0,
        		n = ref_etfs.length;
        	var prices_concat = [];

        	var prices_callback = function(prices) {
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

        		etf_price(ref_etfs[index++][0], prices_callback);
        	};


        	etf_price(ref_etfs[index++][0], prices_callback);
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

        $ClientFactory.valo(function (valo) {
            var data_valo = [];

            for (var date in valo) {
                data_valo.push([new Date(date).getTime(), valo[date]]);
            }

            data_valo.sort(function (a, b) {
                return a[0] - b[0];
            });

            // Trades
            $ClientFactory.trades(function(trades) {
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
                    var series = [{      //the value of portofolio
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
                    LoadStockChart(series, $('#simulation-past'), null, true);

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

                        LoadStockChart(series, $('#simulation-future'), null, true);
                    });
                }
            });
        });
    })
    .controller('InvestirValidationController', function($scope, $element) {});