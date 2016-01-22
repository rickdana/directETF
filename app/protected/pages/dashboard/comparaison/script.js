//Comparison with ETF sans fiscalité
function reference_etf(prices, valo_wallet, data_valo_wallet, trades_cashin_stockin) {
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
			for (var date in trades_cashin_stockin) {
				has_trade = false;
				if (date_price == date) {
					info_invest.push([date_price, trades_cashin_stockin[date], prices_parsed[date_price]]);
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

//Comparison with ETF avec fiscalité
function reference_fiscalite(data_ref_etf, tax, trades_by_date) {
	var data_ref_etf_fis = [];
	var fiscalite = 0;
	var trades = {};

	for (var date in trades_by_date) {
		trades[new Date(date).getTime()] = trades_by_date[date];
	}

	for (var i in data_ref_etf) {
		var valeur_initial = trades[data_ref_etf[i][0]];
		fiscalite += calcul_fiscalite(data_ref_etf[i][1], valeur_initial, tax);
		data_ref_etf_fis.push([data_ref_etf[i][0], data_ref_etf[i][1] - fiscalite]);
	}

	data_ref_etf_fis.sort(function (a, b) {
		return a[0] - b[0];
	});
	return data_ref_etf_fis;

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

//calcul la fiscalite
function calcul_fiscalite (data, valeur_initial, tax) {
	var x = data - valeur_initial;
	return  x > 0 ? x * tax : 0;
}

//Comparaispon compte-epargne
	function reference_livret ( rate, trades, valo ) {
		var rate_by_month = rate / 24;
		var evolution = {};
		var ref_livret =[];
		var array_trades = [];
		var end_date = new Date(valo[valo.length - 1][0]);
		var end_month = parseInt(end_date.getMonth()) + 1;
		var end_date_string = end_date.getFullYear() + '-' + end_month + '-' +end_date.getDate();

		for (var date in trades) {
			array_trades.push([date, trades[date]]);
		}

		array_trades.sort(function (a, b) {
			return comparator_date(a[0], b[0]);
		});


		for (var i = 0; i < array_trades.length; i++) {

			var money_invest = array_trades[i][1];
			var sum = array_trades[i][1] + load_evolution_recent(array_trades[i][0], evolution);
			evolution[array_trades[i][0]] = sum;

			for (var j = 1; j <= calcu_nombre_quinzaine(array_trades[i][0], end_date_string); j++) {
				var interest = money_invest *  rate_by_month * j;
				var date_quinzaine = calcu_date_quinzaine(array_trades[i][0], j);
				if (typeof evolution[date_quinzaine] =='undefined') {
					evolution[date_quinzaine] = sum + interest;
				} else {
					evolution[date_quinzaine] +=  (money_invest + interest);
				}
			}


		}

		//calculer l'intérêt de la somme de l'année dernière
		var first_year = parseInt(new Date(valo[0][0]).getFullYear());
		var last_year = parseInt(new Date(valo[valo.length - 1][0]).getFullYear());
		for (var i = 1; i <= (last_year - first_year); i++) {
			var first_day = first_year + i + '-01' + '-01';
			for (var j = 1; j <= calcu_nombre_quinzaine(first_day,
				end_date_string); j++) {
				var solde_last_year = evolution[first_day];
				var interest = solde_last_year *  rate_by_month * j;
				var date_quinzaine = calcu_date_quinzaine(first_day, j);
				if (typeof  evolution[date_quinzaine] == 'undefined') {
					evolution[date_quinzaine] = solde_last_year + interest;
				} else {
					evolution[date_quinzaine] +=  interest;
				}

			}
		}

		for (var date in evolution) {
			ref_livret.push([new Date(date).getTime(), evolution[date]]);
		}

		ref_livret.sort(function (a, b) {
			return a[0] - b[0];
		});

		return ref_livret;
	}

	//calcul la date de l'evolution plus récente
	function load_evolution_recent (date, evolution) {
		var dates = Object.keys(evolution);

		dates.sort(function (a, b) {
			return comparator_date(a, b);
		});

		var i = 0;
		for (i; i < dates.length; i++) {
			if (comparator_date(date, dates[i]) == -1) {
				break;
			}
		}
		i-= 1;
		if (i >= 0) {
			return evolution[dates[i]];
		} else {
			return 0;
		}

	}

	//calcul la nombre quinzaine à partir une date à la fin d'année
	function calcu_nombre_quinzaine (date, end_date) {
		var n = 0;


		if(date.substr(0,4) < end_date.substr(0,4)) { //investissement avant cette année
			var day = date.substr(8,2);
			var month = date.substr(5,2);
			if (day <=15) {
				n = (12 - month) * 2 + 2;
			} else {
				n = ((12 - month)) * 2 + 1;
			}

		} else {  //investisement dans cette année
			var n_last_month = end_date.substr(8,2) > 15 ? 2 : 1;
			var end_month = end_date.substr(5,2) - 1;
			var day = date.substr(8,2);

			if (day <=15) {
				n = (end_month - date.substr(5,2)) * 2 + 1;
			} else {
				n = ((end_month - date.substr(5,2))) * 2 ;
			}

			n += n_last_month;
		}
		return n;
	}

	//calcul la date de chaque quizaine
	function calcu_date_quinzaine(date, j) {
		var date_quinzaine;
		var year = date.substr(0,4);
		var month = date.substr(5,2);
		var day = date.substr(8,2);
		var month_quinzaine;
		var day_quinzaine;

		if(j % 2 == 1) {
			if (day <= 15) {
				day_quinzaine = '16';
			} else {
				month =  parseInt(month) + 1;
				day_quinzaine = '01';
			}
		} else {
			if (day <= 15) {
				day_quinzaine = '01';
			} else {
				day_quinzaine = '16';
			}
		}

		month_quinzaine = parseInt(j / 2) +  parseInt(month);
		if (month_quinzaine < 10) {
			month_quinzaine = '0' + month_quinzaine;
		}
		if(month_quinzaine > 12) {
			year = parseInt(year) + 1;
			month_quinzaine = '01';
			day_quinzaine = '01'
		}
		date_quinzaine = year + '-' + month_quinzaine + '-' + day_quinzaine;
		return date_quinzaine;

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

//Reference housing sans fiscalité
function reference_house(rates, trades_by_date, valo_wallet, ref_infos) {
	var ref_house =[];
	var start = new Date(valo_wallet[0][0]);
	var start_time = 0;
	var end_time = 0;
	var num_ref = 0;

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

	var is_first_month = true;

	var percent;
	var day_year_fiscalite;
	var fiscalite = 0;
	for (var i in ref_infos) {
		if (typeof ref_infos[i].data == 'object') {
			percent = ref_infos[i].tax;
			day_year_fiscalite = ref_infos[i].date_tax;
		}
	}

	for(var i in rates) {
		if(comparator_year_month(rates[i][0], start_time) != -1 && comparator_year_month(rates[i][0], end_time) != 1) {
			var amount = get_amount_month(trades_by_date, rates[i][0]);
			var d2 = amount[0];

			if (is_first_month) {
				ref_house.push([new Date(amount[0]).getTime(),amount[1]]);
				num_ref++;
				is_first_month = false;
			} else {
				ref_house.push([new Date(amount[0]).getTime(),amount[1] * (rates[i - 1][1] / 100 + 1) - fiscalite]);
				num_ref++;
			}
		}
	}

	return ref_house;
}


function load_comparaison_valo_trades(data_valo, trades, trades_by_date, $scope) {
	var invests_by_date = {};
	var data_trades = [];


	//Bénéfices vs Investissement
	for (var i = 0, n = trades.length; i < n; i++) {
		//CASHIN
		if (typeof invests_by_date[trades[i].date] == 'undefined' && trades[i].type == 'CASHIN') {
			invests_by_date[trades[i].date] = 0;
		}
		switch (trades[i].type) {

			case 'CASHIN':
				invests_by_date[trades[i].date] += trades[i].cash;
		}
	}

	//CASHIN and STOCKIN
	for (var date in trades_by_date) {
		data_trades.push([new Date(date).getTime(), trades_by_date[date]]);
	}
	data_trades.sort(function (a, b) {
		return a[0] - b[0];
	});

	var series = [
		// Portefeuille
		{      //the value of wallet
			id: 1,
			name: 'Portefeuille',
			type: 'spline',
			data: data_valo,
			color: 'rgb(50, 197, 210)',
			fillOpacity: 0.2
		},
		// Investissement
		{        //trades of client
			id: 2,
			name: 'Investissement',
			data: data_trades,
			type: 'spline',
			color: 'rgb(111, 111, 119)',
			fillOpacity: 0.15,
			dashStyle: 'ShortDot'
		}
	];


/*	//hover  ????
	var text_box = $('#text-comparaison');
	var on_rendered = function (chart) {
		if (series.length == chart.series.length) {
			setTimeout(function() {
				$(chart.series).each(function (i, serie) {
					if (!$(serie.legendItem).length) {
						return;
					}


					$(serie.legendItem.element).hover(function () {
						var x= this.getBoundingClientRect().left;
						var y =this.getBoundingClientRect().top;
						var text =  $('#text-comparaison p');
						text.html(load_lengend_text(serie.legendItem.textStr));
						text_box.css('top', y + 13 + 'px');
						text_box.css('left', x + 'px');
						text_box.show();
					}, function () {
						text_box.hide();
					});
				});
			}, 100);
		}
	};*/

	LoadStockChart(series, $('#portefeuille-comparaison-stockchart'), false);

	var chart =  $('#portefeuille-comparaison-stockchart').highcharts();
	chart.rangeSelector.buttons[4].setState(2);
	chart.rangeSelector.clickButton(4,4,true);

}

function show_legend (chart, serie) {
	serie.options.showInLegend = true;
	chart.legend.renderItem(serie);
	chart.legend.render();
}

function hide_legend (chart, serie) {
	serie.options.showInLegend = false;
	serie.legendItem = null;
	chart.legend.destroyItem(serie);
	chart.legend.render();
}

function load_comparaison_reference ($scope, $EtfsFactory, valo, data_valo, trades, ref_name, ref_infos, trades_by_date) {

	var chart = $('#portefeuille-comparaison-stockchart').highcharts();
	var visible_1 = chart.get(1).visible;   //la courbe portefeuille
	var visible_2 = chart.get(2).visible;   //la courbe investissement
	$scope.periodeSelect = $scope.periodeData[2];
	$(chart.series).each(function(){
		hide_legend(chart, this);
		this.setVisible(false, false);
	});

	chart.get(1).setVisible(visible_1, false);
	show_legend(chart, chart.get(1));
	chart.get(2).setVisible(visible_2, false);
	show_legend(chart, chart.get(2));

	if(ref_name == '') {
		document.getElementById('ref_fis_checkbox').checked = false;
		document.getElementById('ref_fis_checkbox').disabled = true;
		return;
	}

	for(var i in chart.series) {
		if (chart.series[i].name == ref_name) {
			chart.series[i].show();
			show_legend(chart, chart.series[i]);

			if (chart.get(ref_name + ' fiscalité') != null) {
				var serie_fiscalite = chart.get(ref_name + ' fiscalité');
				show_legend(chart, serie_fiscalite);
				document.getElementById('ref_fis_checkbox').checked = false;
				document.getElementById('ref_fis_checkbox').disabled = false;
			} else {
				document.getElementById('ref_fis_checkbox').checked = false;
				document.getElementById('ref_fis_checkbox').disabled = true;
			}
			return;
		}
	}

	var trades_cash_stockin = {};

	// all the TYPE STOCKIN and CASHIN in the trades according to the trades' date
	for (var i = 0, n = trades.length; i < n; i++) {

		if (typeof trades_cash_stockin[trades[i].date] == 'undefined' && (trades[i].type == 'CASHIN' || trades[i].type == 'STOCKIN')) {
			trades_cash_stockin[trades[i].date] = 0;
		}
		switch (trades[i].type) {

			case 'CASHIN':
				trades_cash_stockin[trades[i].date] += trades[i].cash;
				break;
			case 'STOCKIN':
				trades_cash_stockin[trades[i].date] += trades[i].cash;
		}
	}

	var on_prices = function (prices) {
		return reference_etf(prices, valo, data_valo, trades_cash_stockin, true);
	};


	for (var j in ref_infos) {
		if (ref_infos[j].name == ref_name) {
			var serie_1 = {};  //référence sans fiscalité
			var serie_2 = {}; //référence avec fiscalité
			var series = [];
			serie_1.color = ref_infos[j].color;
			serie_1.type = ref_infos[j].type;
			serie_1.name = ref_name;
			serie_1.fillOpacity = 0.2;
		/*	serie_1.events = {
				legendItemClick : function() {
					$scope.$apply(function () {
						$scope.data.repeatSelect = "";
					})
					return false;
				}
			};*/
			serie_1.events = {
				legendItemClick : function() {
					return false;
				}
			};
			serie_2.color = ref_infos[j].taxColor;
			serie_2.type = 'line';
			serie_2.name = ref_name + ' fiscalité';
			serie_2.id = serie_2.name;
			serie_2.fillOpacity = 0.2;
			/*	serie_2.events = {
                    legendItemClick : function() {
                        $scope.$apply(function () {
                            $scope.data.repeatSelect = "";
                        })
                        return false;
                    }
                };*/
			serie_2.events = {
				legendItemClick : function() {
					return false;
				}
			};
			serie_2.tax = ref_infos[j].tax;
			serie_2.visible = false;
			document.getElementById('ref_fis_checkbox').checked = false;
			document.getElementById('ref_fis_checkbox').disabled = false;

			//Highcharts.seriesTypes.line.prototype.drawLegendSymbol =
			//	Highcharts.seriesTypes.area.prototype.drawLegendSymbol;

			switch (typeof ref_infos[j].data) {
				case 'string':    //Référence ETF
					serie_1.isin = ref_infos[j].data;
					$EtfsFactory.prices(serie_1.isin, (function(serie) {
						return function (err, prices) {
							serie_1.data = on_prices(prices);
							serie_2.data = reference_fiscalite(serie_1.data, serie_2.tax / 356, trades_by_date);
							series.push(serie_1);
							series.push(serie_2);
							LoadStockChart(serie, $('#portefeuille-comparaison-stockchart'), false);
						}
					})(series));
					break;
				case 'number': //Référence LivretA
					serie_1.data = reference_livret (ref_infos[j].data, trades_cash_stockin, data_valo);
					serie_2.data = reference_fiscalite(serie_1.data, serie_2.tax / 24, trades_by_date);
					series.push(serie_1);
					series.push(serie_2);
					LoadStockChart(series, $('#portefeuille-comparaison-stockchart'), false);
					break;
				case 'object': //Référence Imobilier
					serie_1.data = reference_house(ref_infos[j].data, trades_by_date, data_valo, ref_infos);
					serie_2.data = reference_fiscalite(serie_1.data, serie_2.tax / 12, trades_by_date);
					series.push(serie_1);
					series.push(serie_2);
					LoadStockChart(series, $('#portefeuille-comparaison-stockchart'), false);
			}

			chart.rangeSelector.buttons[4].setState(2);
			chart.rangeSelector.clickButton(4,4,true);


			break;
		}
	}
}

function show_fiscalite (serie_name) {
	var chart = $('#portefeuille-comparaison-stockchart').highcharts();

		for(var i in chart.series) {
			if (chart.series[i].name == serie_name) {
				chart.series[i].show();
				return;
			}
		}
}

function hide_fiscalite (serie_name) {
	var chart = $('#portefeuille-comparaison-stockchart').highcharts();

	for(var i in chart.series) {
		if (chart.series[i].name == serie_name) {
			chart.series[i].hide();
			return;
		}
	}
}
