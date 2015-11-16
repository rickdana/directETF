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

//Simulation of investments in the wallet
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

//Simulation of investments in the wallet
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

$(document).ready(function() {
	var client_id = $.cookie('client_id') || '1';

	//chart
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
				var invest_etfs = [['NG0959211241', 100],['FR0010344861', 5]];
				simulation(invest_etfs, valo, data_valo, function(new_invest) {


					//simulation-graph of the past
					$('#simulation-past').highcharts('StockChart', {
						title: {
							floating: !true,
							useHTML: true,
							text: 'Simulation passée',
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
						}, {
							name: 'Nouveaux investissements',
							data: new_invest,
							type: 'spline',
							color: 'rgb(91, 173, 255)'
						}]
					});

					//Benefice
					var profit = new_invest[new_invest.length - 1][1] - data_valo[data_valo.length - 1][1] -
									(new_invest[0][1] - data_valo[0][1]);
					var num_profit = $("#simulation-text span");
					num_profit.append(profit + ' &euro;');

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
					$('#simulation-future').highcharts({
						title: {
							floating: !true,
							useHTML: true,
							text: 'Simulation future',
							style: {
								color: 'rgb(69, 114, 167)',
							},
						},

						xAxis: {
							type: 'datetime',
						},

						yAxis: [{ // Primary yAxis
							title: {
								text: ' ',
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
							y: 12,
							backgroundColor: 'transparent',
							itemStyle: {
								color: 'rgb(69, 114, 167)',
							}
						},

						colorAxis: null,

						tooltip: {
							shared: true,
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

						plotOptions: {
							series: {
								marker: {
									enabled: false,
								},
							},

							area: {
								marker: {
									symbol: 'circle',
									radius: 2,
									states: {
										hover: {
											enabled: true
										}
									},
								}
							}
						},

						series: [{
							name: 'Nouveaux investissements',
							data: data_invest_future,
							type: 'spline',
							color: 'rgba(132, 183, 97, 0.9)',
							threshold: null
						},{
							name: 'Variation des investissements',
							data: range_invest_future,
							type: 'arearange',
							lineWidth: 0,
							linkedTo: ':previous',
							color: 'rgb(132, 183, 97)',
							fillOpacity: 0.6,
							zIndex: 1
						},{
							name: 'Portefeuille',
							type: 'spline',
							data: data_valo_future,
							color: 'rgba(253, 212, 0, 0.9)',
							threshold: null
						},{
							name: 'Variation des portefeuille',
							data: range_valo_future,
							type: 'arearange',
							lineWidth: 0,
							linkedTo: ':previous',
							color: 'rgb(253, 212, 0)',
							fillOpacity: 0.6,
							zIndex: 0
						}]
					});

					});
				});
			});
		}
	});



});

