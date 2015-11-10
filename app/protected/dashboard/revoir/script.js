
//regroup the invests
function join_simulation(simulation, simulation_total) {

	for(var i in simulation) {
		for(var date in simulation[i]){
			if(typeof simulation_total[date] == 'undefined') {
				simulation_total[[date]] = simulation[i][date];
			}else {
				simulation_total[[date]] += simulation[i][date];
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

//Simulation of investments in the wallet
function simulation(ref_etfs, valo, done_simulation) {
	simulation_etfs = [];
	var simul_etfs = {};
	var index = 0,
		n = ref_etfs.length;
	var prices_concat = [];

	var prices_callback = function(prices) {
		// Get the value of the ETF for each date
		for (var i = 0, size = prices.length; i < size; i++) {
			for (var date in prices[i]) {
				prices[i][date] *= ref_etfs[index - 1][1];
			}
		}

		prices_concat = prices_concat.concat(prices);

		if (index == n) {
			//simulation = simulation_invest_wallet(prices, valo, ref_etfs[i][1]);
			//console.log(JSON.stringify(prices_concat))
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
					simulation(invest_etfs, valo, function(new_invest) {

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
							}, {
								name: 'Nouvel investissement',
								data: new_invest,
								type: 'spline',
								color: 'rgb(91, 173, 255)'
							}]
						});

						//Benefice
						var profit = new_invest[new_invest.length - 1][1] - data_valo[data_valo.length - 1][1] -
										(new_invest[0][1] - data_valo[0][1]);
						var num_profit = $("#profit span");
						num_profit.append(profit + ' &euro;');
					});
				});
		}
	});



});

