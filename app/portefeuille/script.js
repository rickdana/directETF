var client_id = $.cookie('client_id') || '1';

$(function () {$.ajax('/config/ws/host', {
		success: function(host) {

		//Bénéfices vs Investissement
		$.ajax({
			cache: false,
			url: host + '/client/valo/' + client_id,
			dataType: "json",
			success: function (valo) {
                var data_valo = [];

                for (var date in valo) {
                    data_valo.push([new Date(date).getTime(), valo[date]]);
                }

                data_valo.sort(function (a, b) {
                    return a[0] - b[0];
                });

                // Trades
                $.getJSON(host + '/client/trades/' + client_id, function (trades) {
                    var trades_by_date = {};
                    var data_trades = [];

                    for (var i = 0, n = trades.length; i < n; i++) {
                        if (typeof trades_by_date[trades[i].date] == 'undefined' && trades[i].type == 'CASHIN') {
                            trades_by_date[trades[i].date] = 0;
                        }
                        switch (trades[i].type) {

                            case 'CASHIN':
                                trades_by_date[trades[i].date] += trades[i].cash;
                                break;
                        }
                    }

                    for (var date in trades_by_date) {
                        data_trades.push([new Date(date).getTime(), trades_by_date[date]]);
                    }
                    data_trades.sort(function (a, b) {
                        return a[0] - b[0];
                    });

                    //Reference
                    $.getJSON(host + '/etf/prices/FR0007052782', function (prices) {
                        var data_reference = [];
                        var data_trades_reference = [];
                        var qdt = 0;
                        for (var date in trades_by_date) {
                            for (var i = 0, n = prices.length; i < n; i++) {
                                for(var date_price in prices[i]){
                                    if (date_price == date) {
                                        data_trades_reference.push([new Date(date).getTime(), trades_by_date[date], prices[i][date_price]]);
                                    }
                                }

                            }
                        }
                        data_trades_reference.sort(function (a, b) {
                            return a[0] - b[0];
                        });
                        for(var i in data_trades_reference) {
                            qdt += Math.floor(data_trades_reference[i][1] / data_trades_reference[i][2]);
                            data_reference.push([data_trades_reference[i][0], qdt]);
                        }

                        $('#profits-investment').highcharts('StockChart', {
                            // version avec un seul graph
                            title: {
                                floating: !true,
                                useHTML: true,
                                text: 'Evolution du portefeuille',
                                style: {
                                    color: 'rgb(255,255,255)',
                                },
                            },

                            yAxis: [{ // Primary yAxis
                                labels: {
                                    style: {
                                        color: 'rgb(243, 156, 18)',
                                        fontWeight: 'bold',
                                        fontSize: '11px'
                                    },
                                },
                                title: {
                                    text: 'Portefeuiile',
                                    style: {
                                        color: 'rgb(243, 156, 18)',
                                        fontSize: '15px'

                                    },
                                },
                                opposite: false,
                            }, { // Secondary yAxis
                                title: {
                                    text: 'Investissement',
                                    style: {
                                        color: 'rgba(255, 255, 255, .8)',
                                        fontSize: '15px'
                                    }
                                },
                                labels: {
                                    style: {
                                        color: 'rgba(255, 255, 255, .8)',
                                        fontSize: '11px'
                                    }
                                },
                            }, { // Third yAxis
                                title: {
                                    text: 'Reference',
                                    style: {
                                        //color: 'rgba(255, 255, 255, .8)',
                                        fontSize: '15px'
                                    }
                                },
                                labels: {
                                    style: {
                                        //color: 'rgba(255, 255, 255, .8)',
                                        fontSize: '11px'
                                    }
                                },
                            }],

                            exporting: {
                                enabled: false
                            },

                            mapNavigation: {
                                enabled: false
                            },

                            legend: {
                                enabled: true,
                                //layout: 'vertical',
                                y: 12,
                                backgroundColor: 'transparent',
                                itemStyle: {
                                    color: 'rgb(69, 114, 167)',
                                }
                            },

                            rangeSelector: {
                                buttonTheme: {
                                    fill: 'none',
                                    stroke: 'none',
                                    'stroke-width': 0,
                                    r: 8,
                                    style: {
                                        color: 'rgb(69, 114, 167)',
                                        fontWeight: 'bold'
                                    },
                                    states: {
                                        hover: {},
                                        select: {
                                            fill: 'rgb(69, 114, 167)',
                                            style: {
                                                color: 'white'
                                            }
                                        }
                                    }
                                },
                                inputBoxBorderColor: 'rgb(216, 216, 216)',
                                /*							inputBoxWidth: 120,
                                 inputBoxHeight: 18,*/
                                inputStyle: {
                                    color: 'rgb(69, 114, 167)',
                                    fontWeight: 'bold',
                                    backgroundColor: '#39cccc'
                                },
                                /*labelStyle: {
                                 color: 'silver',
                                 fontWeight: 'bold'
                                 },*/
                                selected: 5
                            },

                            colorAxis: null,


                            plotOptions: {
                                areaspline: {
                                    fillOpacity: 0
                                },
                                series: {
                                    borderColor: 'transparent',
                                    borderRadius: '3px',
                                }
                            },

                            navigator: {
                                outlineWidth: 2,
                                height: 35,
                                margin: 25,
                                maskFill: 'rgba(19, 159, 159, .5)',
                            },

                            scrollbar: {
                                enabled: true,
                            },

                            series: [{      //the value of wallet
                                tooltip: {
                                    valueDecimals: 2
                                },
                                name: 'Portefeuille',
                                type: 'spline',
                                data: data_valo,
                                color: 'rgb(243, 156, 18)',
                            }, {        //trades of client
                                name: 'Investissement',
                                data: data_trades,
                                type: 'column',
                                color: 'rgba(255, 255, 255, .8)',
                                tooltip: {
                                    valueDecimals: 2
                                },
                                yAxis: 1,
                                pointWidth: 20,
                            }, {        //the reference
                                name: 'Reference',
                                data: data_reference,
                                type: 'spline',
                                color: 'rgba(0, 0, 0, .6)',
                                yAxis: 2,
                                dashStyle: 'shortdot',
                            }]
                        });
                    });
                });
            }
		});

		var etfsClient = [];

		//Load infos of wallet
		$.getJSON(host + '/client/portfolio/' + client_id, function (walClient) {
			var value = $("#portefeuille-valeur span");
			var num = walClient['cash']['EUR'].toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') ;
			value.append(num);
			var dividends = $("#portefeuille-benefice span");
			var num1 = "<span>"
					+	walClient['dividends']['EUR'].toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' &euro;' +
					"</span>";
			dividends.append(num1);
			etfsClient = walClient['etf'];

		// Load client's ETF
		//$.getJSON(host + '/client/etfs?id=' + client_id, function (etfsClient) {
			var etfs = [];
			var s = 0;
			var percents = {};
			var percents_c = {};

			for (var code in etfsClient) {
				//etfs.push(code);
				s += etfsClient[code];
			}


			for (var code in etfsClient) {
				percents[code] = (etfsClient[code] * 100 / s).toFixed(2);
			}

			var data_parsed = [];
			var data_sector = [];

			// Maps
			for (var c in etfsClient){
				$.getJSON(host + '/etf/desc/' + c,  function (etfs) {
					if (typeof percents_c[etfs['countries']] == 'undefined') {
						percents_c[etfs['countries']] = 0;
					}

					percents_c[etfs['countries']] += parseFloat(percents[etfs['isin']]);

					$.getJSON(host + '/etf/price/' + etfs['isin'],  function (dayPrice) {
						for (var i in dayPrice) {
							var price = dayPrice[i];
						}

						data_parsed.push({
							code: etfs['isin'],
							etfName: etfs['name'],
							country: etfs['countries'][0],
							sector: etfs['sectors'][0],
							value: percents_c[etfs['countries']],
							p: percents_c[etfs['countries']],
						});


						var mapData = Highcharts.geojson(Highcharts.maps['custom/world']);


						$('#investment-maps').highcharts('Map', {

							title: {
								floating: !true,
								useHTML: true,
								text: "R&eacute;partition dans le monde",
								style: {
									color: 'rgb(255,255,255)',
								},
							},
							exporting: {
								enabled: false
							},

							legend: {
								enabled: false
							},

							mapNavigation: {
								enabled: true,
								buttonOptions: {
									verticalAlign: 'bottom'
								},
								enableMouseWheelZoom: false,
							},

							tooltip: {
								useHTML: true,
								formatter: function () {
									if (this.point.value) {
										return this.point.country + ' : ' + this.point.p + '%';
									}
								}
							},

							series: [{
								mapData: mapData,
								enableMouseTracking: false
							}, {
								//type: 'mapbubble',
								mapData: mapData,
								name: 'ETF information',
								joinBy: ['iso-a2', 'country'],
								data: data_parsed,
								minSize: 4,
								maxSize: '12%',
							}]
						});

						var list = $("#investment-list tbody");

						var gain = (Math.floor(Math.random() * 30) + 2) * (Math.random() < 0.5 ? -1 : 1);
						var line = "<tr>"
							+ '<td class="waves-effect waves-light"><a href="javascript:void(0)" onclick="show_etf_info(this)" data-code="' + c + '">' + etfs['name'] + '</a></td>'
							+ (gain >= 0 ? "<td style='color:green;'>" : "<td style='color:red;'>")
							+ "<span class='percent' style='display:none;'>" + ((gain / etfsClient[etfs['isin']] / price) * 100).toFixed(2) + "%</span>"
							+ "<span class='currency' style='display:none;'>" + gain + "&euro;</span>"
							+ "<span class='number' style='display:inline;'>" + gain + "&euro;</span>"
							+ "</td>"
							+ "<td style='text-align:center'>"
							+ "<span class='percent' style='display:none;'>" + percents[etfs['isin']] + "%</span>"
							+ "<span class='currency' style='display:none;'>" + (etfsClient[etfs['isin']] * price) + "&euro;</span>"
							+ "<span class='number' style='display:inline;'>" + etfsClient[etfs['isin']] + "</span>"
							+ "</td>" +
							"</tr>";

						list.append(line);


						$.getScript('/public/js/helpers/etf-info-box.js');

						// Sectors
						var percents_s = {};


						if (typeof percents_s[etfs['sectors']] == 'undefined') {
							percents_s[etfs['sectors']] = 0;
						}
						percents_s[etfs['sectors']] += parseFloat(percents[etfs['isin']]);


						for (var s in percents_s) {
							data_sector.push({
								name: s,
								y: parseFloat(percents_s[s])
							});
						}

						//data_sector[0].sliced = true;
						//data_sector[0].selected = true;
						data_sector.sort(function (a, b) {
							return b.y - a.y
						});

						for (var i = 3; i < data_sector.length; i++) {
							data_sector[i].visible = false;
						}

						var sector_info_box = $('#sector .info-box');
						// Build the chart
						$('#sectors-overview').highcharts({
							colors: Highcharts.map(Highcharts.getOptions().colors, function (color) {
								return {
									radialGradient: {
										cx: 0.5,
										cy: 0.3,
										r: 0.7
									},
									stops: [
										[0, color],
										[1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
									]
								};
							}),

							title: {
								floating: !true,
								useHTML: true,
								text: 'R&eacute;partition par secteurs',
								style: {
									color: 'rgb(255,255,255)',
								},
							},

							exporting: {
								enabled: false
							},

							credits: {
								style: {
									color: 'transparent'
								}
							},
							chart: {
								plotBackgroundColor: null,
								plotBorderWidth: null,
								plotShadow: false,
								type: 'pie',

							},

							exporting: {
								enabled: false
							},

							tooltip: {
								pointFormat: ' <b>{point.percentage:.1f}%</b>'
							},

							plotOptions: {
								pie: {
									ignoreHiddenPoint: false,
									allowPointSelect: true,
									cursor: 'pointer',
									dataLabels: {
										enabled: false,
									},
									showInLegend: true,
									borderColor: "rgba(243, 156, 18, .5)",
								},
								series: {
									shadow: true
								},
							},

							series: [{
								name: "Sectors",
								colorByPoint: true,
								data: data_sector,
								point: {
									events: {
										select: function (e) {
											this.slice(false);
										},
									}
								},
								events: {
									click: function (e) {
										current_pie = e;

										var rgb = e.point.color.stops[1][1].match(/\d+,\s?\d+,\s?\d+/)[0]
											, rgba = 'rgba(' + rgb + ', .8)';

										if (sector_info_box.attr('data-current') == e.point.name) {
											sector_info_box.attr('data-current', '');
											sector_info_box.hide('slow');
										} else {
											sector_info_box.show('slow');
											sector_info_box.attr('data-current', e.point.name);
										}

										sector_info_box.find('.info-box-title').text(e.point.name + " " + e.point.percentage.toFixed(1) + "%");

										sector_info_box.find('.info-box-icon, .btn')
											.css('color', 'rgba(255,255,255,.8)')
											.css('background-color', rgba);
									}
								}
							}],

							colorAxis: null,

							legend: {
								enabled: true,
								labelFormat: '{name} ({percentage:.1f}%)',
								maxHeight: 81,
								navigation: {
									activeColor: '#3E576F',
									animation: true,
									arrowSize: 9,
									inactiveColor: '#CCC',
									style: {
										fontWeight: 'bold',
										color: '#333',
										fontSize: '11px',
									},
								},
							},


						});

						sector_info_box.css('display', 'block')
							.hide()
							.find('.btn').on('click', function () {
								sector_info_box.hide('slow');
								sector_info_box.attr('data-current', '');
								current_pie.point.slice(false);
							});

					});
				});

			}

		});



		// BEGIN COUNTER FOR SUMMARY BOX
		  $(".counter-num").each(function() {
			  var o = $(this);
			  var end = Number(o.html()),
				  start = end > 1000 ? Math.floor(end - 500) : Math.floor(end / 2),
				  speed = start > 500 ? 1 : 10;

			  $(o).html(start);

			  setInterval(function(){
				  var val = Number($(o).html());
				  if (val < end) {
					  $(o).html(val+1);
				  } else {
					  clearInterval();
				  }
			  }, speed);
		  });
      		//END COUNTER FOR SUMMARY BOX
      }
	});
});

//FORMATTING

//formatting the value of wallet and the dividend
/*var x = ($('#profits-investment').height() - $('#portefeuille').height()) / 2;
 $('#portefeuille > div').each(function() {
 $(this).css('height', ($(this).height() + x) + 'px');
 });*/

//different display of etfs ( euro, percent, quanlity)
jQuery(document).ready(function(){

		jQuery('.percent-filter').click(function(){
			jQuery('.compo-filter.selected').removeClass('selected');
			jQuery('.percent-filter').addClass('selected');
           	$('.percent').show();
           	$('.number').hide();
           	$('.currency').hide();
        });

		jQuery('.number-filter').click(function(){
			jQuery('.compo-filter.selected').removeClass('selected');
			jQuery('.number-filter').addClass('selected');
			$('.number').show();
			$('.percent').hide();
			$('.currency').hide();
		});

		jQuery('.currency-filter').click(function(){
			jQuery('.compo-filter.selected').removeClass('selected');
			jQuery('.currency-filter').addClass('selected');
			$('.currency').show();
			$('.number').hide();
			$('.percent').hide();
		});

});


