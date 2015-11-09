//Comparison with ETF
function reference_etf(prices, valo_wallet, data_valo_wallet, invests_by_date) {
	var evolution = {};
	var info_invest = [];
	var qdt = 0;
	var prices_parsed = {};
	var data_ref_etf = [];
	var somme_trades = 0;

	for (var i = 0, n = prices.length; i < n; i++) {
		for (var date in prices[i]) {
			prices_parsed[date] = prices[i][date];
		}
	}

	for(var date_price in prices_parsed){
		if (new Date(date_price).getTime() >= data_valo_wallet[0][0]){
			for (var date in invests_by_date) {
				has_trade = false;
				if (date_price == date) {
					info_invest.push([date_price, invests_by_date[date], prices_parsed[date_price]]);
					has_trade = true;
					break;
				}
			}
			if (!has_trade) {
				info_invest.push([date_price, 0, prices_parsed[date_price]]);
			}
		}
	}

	info_invest.reverse();

	for(var i in info_invest) {
		somme_trades += info_invest[i][1]
		qdt += info_invest[i][1] / info_invest[i][2];
		evolution[info_invest[i][0]] = Math.floor((qdt * info_invest[i][2]));
	}

	for (var date in valo_wallet) {
		for(var d_evolution in evolution) {
			if (date == d_evolution) {
				data_ref_etf.push([new Date(date).getTime(), evolution[date]]);
				break;
			}
		}
	}
	data_ref_etf.sort(function (a, b) {
		return a[0] - b[0];
	});

	return data_ref_etf;
}

//comparison of dates
function comparator_date(a, b) {
	var d1 = a.split('-');
	var d2 = b.split('-');

	if (d1[0] > d2[0]){
		return 1;
	}else if(d1[0] == d2[0]) {
		if (d1[1] > d2[1]){
			return 1;
		}else if(d1[1] == d2[1]) {
			if (d1[2] > d2[2]){
				return 1;
			}else if(d1[2] == d2[2]) {
				return 0;
			}else {
				return -1;
			}
		}else {
			return -1;
		}
	}else {
		return -1;
	}
}

//comparison of the dates with year and month
function comparator_year_month(a, b) {
	var d1 = a.split('-');
	var d2 = b.split('-');

	if (d1[0] > d2[0]){
		return 1;
	}else if(d1[0] == d2[0]) {
		if (d1[1] > d2[1]){
			return 1;
		}else if(d1[1] == d2[1]) {
			return 0;
		}else {
			return -1;
		}
	}else {
		return -1;
	}
}

//Reference of deposit
function evolution_interest(today, invest, date, date_after_one_year, rate, evolution) {
	for(var dat_evol in evolution) {
		if(comparator_date(dat_evol, date) != -1) {
			evolution[dat_evol] += invest;
		}
	}

	while(date_after_one_year.getTime() <= today.getTime()) {
		d = date_after_one_year.toISOString().substr(0,10);
		interest = invest * (1 + rate) - invest;
		for(var dat_evol in evolution) {
			if(comparator_date(dat_evol, d) != -1) {
				evolution[dat_evol] += interest;
			}
		}
		date_after_one_year.setFullYear( date_after_one_year.getFullYear() + 1);
	}
	return evolution;
}

//Reference of deposit
function reference_interest(rate, valo_wallet, trades) {
	var evolution = {};
	var ref_interest =[];

	for (var date in valo_wallet) {
		evolution[date] = 0;
	}

	for (var date in trades) {
		var date_after_one_year = new Date(date);
		date_after_one_year.setFullYear( date_after_one_year.getFullYear() + 1);

		evolution = evolution_interest(new Date(), trades[date], date, date_after_one_year, rate, evolution);
	}

	for (var date_valo in valo_wallet) {
		ref_interest.push([new Date(date_valo).getTime(), evolution[date_valo]]);
	}


	ref_interest.sort(function (a, b) {
		return a[0] - b[0];
	});

	return ref_interest;
}

//get the total of investment par mois demandé
function get_amount_month(trades_by_date, time) {
	var amount = [];
	for(var i = 1; i < 32; i++ ){
		if(i < 10) {
			date = time + '-0' + i;
		} else {
			date = time + '-' + i;
		}

		if (typeof trades_by_date[new Date(date)] != 'undefined') {
			amount = [date, trades_by_date[new Date(date)]];
			return amount;
		}
	}

}

//Reference housing
function reference_house(rates, trades_by_date, valo_wallet) {
	var ref_house =[];
	var start = new Date(valo_wallet[0][0]);
	var start_time = 0;
	var end_time = 0;

	if(start.getMonth() < 9){
		start_time = start.getFullYear() + '-0' + (parseInt(start.getMonth())+1);
	} else {
		start_time = start.getFullYear() + '-' + (parseInt(start.getMonth())+1);
	}


	var end = new Date(valo_wallet[valo_wallet.length - 1][0]);
	if(end.getMonth() < 9){
		end_time = end.getFullYear() + '-0' + (parseInt(end.getMonth())+1);
	} else {
		end_time = end.getFullYear() + '-' + (parseInt(end.getMonth())+1);
	}


	for(var i in rates) {
		if(comparator_year_month(rates[i][0], start_time) != -1 && comparator_year_month(rates[i][0], end_time) != 1) {
			amount = get_amount_month(trades_by_date,rates[i][0]);
			ref_house.push([new Date(amount[0]).getTime(),amount[1] * (rates[i][1] / 100 + 1)]);
		}
	}

	return ref_house;
}

$(document).ready(function() {
	var client_id = $.cookie('client_id') || '1';
	var rate_house_month = [['2013-01', 2.95], ['2013-02', 2.80], ['2013-03', 2.80],['2013-04', 2.75], ['2013-05', 2.75], ['2013-06', 2.70],
							['2013-07', 2.80], ['2013-08', 2.90], ['2013-09', 2.90],['2013-10', 2.95], ['2013-11', 2.95], ['2013-12', 2.90],
							['2014-01', 2.90], ['2014-02', 2.85], ['2014-03', 2.80],['2014-04', 2.70], ['2014-05', 2.60], ['2014-06', 2.60],
							['2014-07', 2.50], ['2014-08', 2.40], ['2014-09', 2.35],['2014-10', 2.25], ['2014-11', 2.15], ['2014-12', 2.10],
							['2015-01', 2.10], ['2015-02', 1.95], ['2015-03', 1.90],['2015-04', 1.80], ['2015-05', 1.75], ['2015-06', 1.80],
							['2015-07', 2.05], ['2015-08', 2.15], ['2015-09', 2.10],['2015-10', 2.20]];

	//Bénéfices vs Investissement
	$.ajax({
		cache: false,
		url: WS_URL + '/client/valo/' + client_id,
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
			$.getJSON(WS_URL + '/client/trades/' + client_id, function (trades) {
				var invests_by_date = {};
				var data_trades = [];
				var trades_by_date = {};
				var somme_trades = 0;
				var trades_ca_sto = {};

				for (var i = 0, n = trades.length; i < n; i++) {
					//CASHIN
					if (typeof invests_by_date[trades[i].date] == 'undefined' && trades[i].type == 'CASHIN') {
						invests_by_date[trades[i].date] = 0;
					}
					switch (trades[i].type) {

						case 'CASHIN':
							invests_by_date[trades[i].date] += trades[i].cash;
					}

					//CASHIN and STOCKIN
					if (typeof trades_ca_sto[trades[i].date] == 'undefined' && (trades[i].type == 'CASHIN' || trades[i].type == 'STOCKIN')) {
						trades_ca_sto[trades[i].date] = 0;
					}
					switch (trades[i].type) {

						case 'CASHIN':
							trades_ca_sto[trades[i].date] += trades[i].cash;
							break;
						case 'STOCKIN':
							trades_ca_sto[trades[i].date] += trades[i].cash;
					}
				}

				//CASHIN and STOCKIN
				for (var x in data_valo) {
					for (var i in trades){
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

				//Reference ETF FR
				$.getJSON(WS_URL + '/etf/prices/FR0010424135', function (prices) {
					var data_ref_etf_fr = reference_etf(prices, valo, data_valo, trades_ca_sto);

					//Reference ETF US
					$.getJSON(WS_URL + '/etf/prices/FR0010168773', function (prices) {
						var data_ref_etf_us = reference_etf(prices, valo, data_valo, trades_ca_sto);

						//Reference ETF WORLD
						$.getJSON(WS_URL + '/etf/prices/FR0010361683', function (prices) {
							var data_ref_etf_world = reference_etf(prices, valo, data_valo, trades_ca_sto);

							//Reference rate 3%
							var data_ref_int = reference_interest(0.03, valo, trades_ca_sto);

							//Reference house
							var data_ref_house = reference_house(rate_house_month, trades_by_date, data_valo);

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
									title: {
										text: ' ',
									},
									opposite: false,
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
									},
								},

								tooltip: {
									valueDecimals: 2,
									useHTML: true,
									valueSuffix: ' &euro; ',
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
									name: 'Portefeuille',
									type: 'spline',
									data: data_valo,
									color: 'rgb(243, 156, 18)',
								}, {        //trades of client
									name: 'Investissement',
									data: data_trades,
									type: 'spline',
									color: 'rgba(255, 255, 255, .8)',
									//yAxis: 1,
									dashStyle: 'longdash'
								}, {        //the reference of french etf
									name: 'Réference ETF FR',
									data: data_ref_etf_fr,
									type: 'spline',
									color: 'rgb(91, 173, 255)',
									visible: false
								}, {        //the reference of american etf
									name: 'Réference ETF US',
									data: data_ref_etf_us,
									type: 'spline',
									color: 'rgb(91, 173, 0)',
									visible: false
								}, {        //the reference of international etf
									name: 'Réference ETF World',
									data: data_ref_etf_world,
									type: 'spline',
									color: 'rgba(255, 112, 77, .8)',
									visible: false
								}, {        //the reference of interest 3%
									name: 'Compte-épargne ',
									data: data_ref_int,
									type: 'spline',
									color: 'rgba(255, 12, 77, .8)',
									dashStyle: 'shortdot',
									visible: false
								}, {        //the reference of interest 3%
									name: 'Imobilier ',
									data: data_ref_house,
									type: 'spline',
									color: 'rgba(130, 12, 77, .8)',
									visible: false
								}]
							});
						});

					});
				});
			});
		}
	});

	var etfsClient = [];

	//Load infos of wallet
	$.getJSON(WS_URL + '/client/portfolio/' + client_id, function (walClient) {
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
	//$.getJSON(WS_URL + '/client/etfs?id=' + client_id, function (etfsClient) {
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
			$.getJSON(WS_URL + '/etf/desc/' + c,  function (etfs) {
				if (typeof percents_c[etfs['countries']] == 'undefined') {
					percents_c[etfs['countries']] = 0;
				}

				percents_c[etfs['countries']] += parseFloat(percents[etfs['isin']]);

				$.getJSON(WS_URL + '/etf/price/' + etfs['isin'],  function (dayPrice) {
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


					$.getScript('/js/helpers/etf-info-box.js');

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

	$('.percent-filter').click(function(){
		$('.compo-filter.selected').removeClass('selected');
		$('.percent-filter').addClass('selected');
		$('.percent').show();
		$('.number').hide();
		$('.currency').hide();
	});

	$('.number-filter').click(function(){
		$('.compo-filter.selected').removeClass('selected');
		$('.number-filter').addClass('selected');
		$('.number').show();
		$('.percent').hide();
		$('.currency').hide();
	});

	$('.currency-filter').click(function(){
	$('.compo-filter.selected').removeClass('selected');
	$('.currency-filter').addClass('selected');
	$('.currency').show();
	$('.number').hide();
	$('.percent').hide();
});
});