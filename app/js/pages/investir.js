$(function () {
    // Global init
    var wallet_cash = 40000;

    var current_step = 1;

    var wizard_state = $("#wizard-state");

    var wizard_panel_1 = $('[data-wizard-panel-step=1]'),
        wizard_panel_1_table = wizard_panel_1.find('table'),
        wizard_panel_1_list = wizard_panel_1_table.find("tbody");

    var wizard_panel_2 = $('[data-wizard-panel-step=2]'),
        wizard_panel_2_table = wizard_panel_2.find('table'),
        wizard_panel_2_list = wizard_panel_2_table.find('tbody'),
        wizard_panel_2_action = wizard_panel_2.find('.etf-action-dropdown').first().hide();

    var wizard_panel_3 = $('[data-wizard-panel-step=3]'),
        wizard_panel_3_table = wizard_panel_3.find('table#summary-table'),
        wizard_panel_3_list = wizard_panel_3_table.find("tbody");

    var wizard_button = function(step) {
        return wizard_state.find("a[data-step=" + step + "]");
    };

    $('.wallet-cash').text(wallet_cash);
    $('.wizard-panel').first().css('display','block').show();

    //
    // Step 1
	var host = 'http://184.51.42.237:9000';

	// Load all the ETFs
	$.getJSON(host + '/etfs', function (etfs) {
		// group ETFs by countries
		var sum = {};

		for (var e in etfs) {
			if (etfs[e].country === 'UK') {
				etfs[e].country = 'GB';
            }
			
			if (typeof sum[etfs[e].country] == 'undefined') {
				sum[etfs[e].country] = 0;
			}
			sum[etfs[e].country] += etfs[e].number;
		}

		// parsing for Maps
		var data_parsed = [];
		
		for (var e in sum) {			
			data_parsed.push({
				code: e, 
				country: e, 
				value: sum[e],
				p: sum[e],
			});
		}

        // Maps
        var mapData = Highcharts.geojson(Highcharts.maps['custom/world']);

        $('#maps-container').highcharts('Map', {
           colors: ["#f0ad4e"],

            title: {
                text: null
            },
            
            exporting: {
            	enabled: false
            },

            legend: {
                enabled: false
            },

            chart: {
                backgroundColor: "transparent",
                style: {
                    border: "none"
                }
            },

           credits: {
              style: {
                 color: 'transparent'
              }
           },

            mapNavigation: {
                enabled: true,
                buttonOptions: {
                    verticalAlign: 'bottom'
                }
            },
            
            tooltip: {
            	useHTML: true,
            	pointFormat: '{point.name}: {point.p} units',
            },

            series : [{
                name: 'Investment by countries',
                mapData: mapData,
                color: '#E0E0E0',
                enableMouseTracking: false
            }, {
                //type: 'mapbubble',
                mapData: mapData,
                name: 'ETF information',
                joinBy: ['iso-a2', 'country'],
                dataLabels: {
                    enabled: !true,
                    color: 'white',
                    formatter: function () {
                        if (this.point.value) {
                            return this.point.name;
                        }
                    }
                },
                data: data_parsed,
                minSize: 4,
                maxSize: '12%',
                events: {
                	click: function(e) {
                		search_input.val(e.point.country);
                		start_search(e.point.country);
                	}
                }
            }]
        });

        //
    	// load list view
        for (var c in etfs) {
        	var flag = "http://files.stevenskelton.ca/flag-icon/flag-icon/svg/country-4x3/" + etfs[c].country.toLowerCase() + ".svg";
        	var tr_id = "etf-" + c;
        	var line = '<tr id="' + tr_id + '">'
	    				+ 	'<td class="etf-column flag"><img class="country-flag" width="" height="21" title="' + etfs[c].country + '" alt="' + etfs[c].country + '" src="' + flag + '"><span style="display:none">' + etfs[c].country + '</span></td>'
		        		+ 	'<td class="etf-column name"><a href="javascript:void(0)">' + etfs[c].name + '</a></td>'
						+ 	'<td class="etf-column sector">' + etfs[c].sector + '</td>'
						+ 	'<td class="etf-column number">' + etfs[c].number + '</td>'
						+ 	'<td class="etf-column price">' + etfs[c].price + '&euro;</td>'
						+ 	'<td class="etf-column price-cash"></td>'
						+ 	'<td class="etf-column order"></td>'
						+ 	'<td class="etf-column option"><input type="checkbox" data-row-id="' + tr_id + '"></td>' +
					   '</tr>';
        	wizard_panel_1_list.append(line);
        }

        // iCheck init
		wizard_panel_1_table.find('input[type=checkbox]').iCheck({
			checkboxClass : 'icheckbox_square-blue',
			increaseArea : '20%'
		});
    	
		//
		// Selected view
		var count_selected_rows_count = 0,

		    selection_legend_action = $("#selection-legend-action"),

			trigger_count_selected_rows = function() {
				count_selected_rows_count = wizard_panel_2_list.find('tr').length;
			},

			compute_order_cash = function() {
			    var sum = 0;
                var wizard_panel_3_list_elements =  wizard_panel_3_list.find('tr');

			    wizard_panel_2_list.find('tr').each(function(i) {
			        var prices = parseInt($(this).find('.order-number').first().text()) * parseFloat($(this).find('.order-price').first().text());

			        $(wizard_panel_3_list_elements.get(i)).find('.price-cash').first().html(prices + ' &euro;');

			        sum += prices;
			    });

			    $('.order-cash').text(sum);
			    $('.cash-diff').text(wallet_cash - sum);

//			    $('.input-range').each(function() {
//			        $(this).data("ionRangeSlider").reset();
//			    })
			};

        var catch_max = $('#catch-max');

        catch_max.ionRangeSlider({
            min: catch_max.attr('data-min'),
            max: wallet_cash,
            from: wallet_cash,
            postfix: catch_max.attr('data-postfix'),
            grid: true,
            hide_min_max: true,
            grid_num: 10
        });

        selection_legend_action.click(function() {
            $(this).hide('slow');
        });
        selection_legend_action.hide();

		trigger_count_selected_rows();
		
		var delete_selected_row = function(row) {
            $("#" + row.attr('id') + '2').remove();
            row.children('td')
               .animate({ padding: 0 })
               .wrapInner('<div />')
               .children()
               .slideUp(function() {
                   row.remove();
                   trigger_count_selected_rows();

                   if (count_selected_rows_count == 0 && current_step == 2) {
                       wizard_button(1).click();
                   }
               });
			};

		wizard_panel_1_table.find('input[type=checkbox]').each(function(i) {
			var current_checkbox = $(this),
				current_row_id = $(this).attr('data-row-id'),
				current_row = $('#' + current_row_id),
				selected_row_id = current_row_id + '-selected',
				selected_row_id2 = current_row_id + '-selected2',
				action_btn = wizard_panel_2_action.clone(),
				cancel_btn = $("<a>", {
					'class': 'cancel_btn btn-flat btn-danger fa fa-remove',
					'data-row-id': current_row_id, 
				});

            action_btn.css('display', 'inline-block !important');
            action_btn.show();

			$(this).on('ifChecked', function() {
				var selected_row = current_row.clone(),
				    selected_row2 = current_row.clone(),

                    percent = 60,

				    price = parseFloat(selected_row.find('.price').text()),
				    price_max = price + Math.floor(price + (price * 50)/100),

                    number_max = parseInt(selected_row.find('.number').text()),
                    number = Math.floor(number_max / 3);

				wizard_panel_2_list.append(selected_row);
				selected_row.show();
				trigger_count_selected_rows();


				selected_row2.attr('id', selected_row_id2)
                             .find('.flag, .sector, .action, .order, .option').remove();

				wizard_panel_3_list.append(selected_row2);


				selected_row.attr('id', selected_row_id)
				            .addClass('selected-row-item');
				selected_row.find('.sector').remove();
				selected_row.find('.option').html('')
							.append(cancel_btn);
                selected_row.find('.order').html('')
                            .append(action_btn);

                action_btn.find('.dropdown-menu').click(function() {
                    return false;
                });

                var order_price = selected_row.find('.order-price'),
				    order_number = selected_row.find('.order-number'),
                    order_percent = selected_row.find('.order-percent');

                var callback_action_percent = function(o) {
                        order_percent.text(o.fromNumber);
                    },
                    callback_action_price = function(o) {
                        order_price.text(o.fromNumber);
                        selected_row2.find('.price').html(o.fromNumber + '&euro;');
                        compute_order_cash();
                    },
                    callback_action_number = function(o) {
                        order_number.text(o.fromNumber);
                        selected_row2.find('.number').text(o.fromNumber);
                        compute_order_cash();
                    };

                action_btn.find('[name=percent-range]').attr({
                                                          'data-from': percent,
                                                          'data-min': 1,
                                                          'data-max': 100,
                                                          'data-callback': 'callback_action_percent',
                                                       });

                action_btn.find('[name=price-range]').attr({
                                                        'data-from': price,
                                                        'data-min': 1,
                                                        'data-max': price_max,
                                                        'data-callback': 'callback_action_price',
                                                     });
                action_btn.find('.price-range-max').text(price_max);

                action_btn.find('[name=number-range]').attr({
                                                         'data-from': number,
                                                         'data-min': 1,
                                                         'data-max': number_max,
                                                         'data-callback': 'callback_action_number',
                                                      });
                action_btn.find('.number-range-max').text(number_max);

                order_price.text(price);
                order_number.text(number);

				cancel_btn.click(function() {
					delete_selected_row(selected_row);
					current_checkbox.iCheck('uncheck');
				});

                action_btn.find('.input-range').each(function() {
                     var fn = $(this).attr('data-callback'),
                         callback = function(o) {
                            eval(fn + '(o);');
                         };

                     $(this).ionRangeSlider({
                         min: $(this).attr('data-min'),
                         max: $(this).attr('data-max'),
                         from: $(this).attr('data-from'),
                         postfix: $(this).attr('data-postfix'),
                         onChange: callback,
                         onUpdate: callback,
                         grid: true,
                         hide_min_max: true,
                         //grid_num: 10
                     });
                });
			}).on('ifUnchecked', function() {
				delete_selected_row($('#' + selected_row_id));
			});
		});



        $('.etf-column.option, .etf-column.flag').css('text-align', 'center');

        var oTable = wizard_panel_1_table.DataTable({
        	bFilter: !false,
        	bInfo: false,
        	paging: false,
	        lengthChange: false,
	        searching: !false,
	        ordering: true,
	        info: true,
	        autoWidth: false,
	        columnDefs: [
                { searchable: false, targets: 5 }
            ],
            order: [1, "asc"]
        });

        $(".dataTables_filter").hide();

        search_input = $('#search-etf');
        start_search = function(q) {
            oTable.search( '' )
                  .columns().search( '' );

            if (typeof q == 'undefined') {
                oTable.search(search_input.val()).draw();
            } else {
                oTable.column(0).search(q).draw();
            }
        };

        search_input.on('keyup', function() {
            start_search();
        } );


        //
        // Step 2
        wizard_state.find("a[data-step=2]").click(function() {

        });


        //
        // Wizard init
        wizard_state.find("a").each(function() {
            $(this).click(function() {
                var active = wizard_state.find('[data-state=current]'),
                    current = $(this);

                if (active.attr('data-step') == current.attr('data-step')) {
                    return false;
                }

                if (current.attr('data-step') == 2 && count_selected_rows_count == 0) {
                    return false;
                }

                if (wizard_state.find('[data-step=' + (current.attr('data-step') - 1) + ']').attr('data-state') == 'unvalid') {
                    return false;
                }

                console.log("Go to step " + current.attr('data-step'), 'log');

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

                $('.wizard-panel').hide('slow');
                $('[data-wizard-panel-step=' + current.attr('data-step') + ']').show('slow');

                if (current.attr('data-step') == 2) {
                    compute_order_cash();
                }
            });



            var step = parseInt($(this).attr('data-step'));

            $('[data-wizard-panel-step=' + step + '] .button').click(function() {
                wizard_button(step + 1).click();
            });
        });

        var window_onscroll_handle = function() {
            if ($(window).scrollTop() > 0) {
                $("#header-scroll-bar").css('opacity', 1);
            } else {
                $("#header-scroll-bar").css('opacity', 0);
            }
        };

        $(window).on('resize', function() {
            window_onscroll_handle();
        });

        $(window).scroll(function() {
            window_onscroll_handle();
        });
	});
});