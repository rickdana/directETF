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

function load_wallet(wallet) {
	var num = wallet['cash']['EUR'].toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	$("#portefeuille-valeur .number").html(num + ' &euro;');

	var num1 = wallet['dividends']['EUR'].toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' &euro;';
	$("#portefeuille-benefice .number").html(num1);

	$('#investment-list, #maps-repartition, #sectors-overview').attr('filter', JSON.stringify(wallet.etf));
}

function load_valo_trades(valo, trades) {
	var invests_by_date = {};
	var data_trades = [];
	var trades_by_date = {};
	var somme_trades = 0;
	var trades_ca_sto = {};
	var rate_house_month = [['2013-01', 2.95], ['2013-02', 2.80], ['2013-03', 2.80],['2013-04', 2.75], ['2013-05', 2.75], ['2013-06', 2.70],
							['2013-07', 2.80], ['2013-08', 2.90], ['2013-09', 2.90],['2013-10', 2.95], ['2013-11', 2.95], ['2013-12', 2.90],
							['2014-01', 2.90], ['2014-02', 2.85], ['2014-03', 2.80],['2014-04', 2.70], ['2014-05', 2.60], ['2014-06', 2.60],
							['2014-07', 2.50], ['2014-08', 2.40], ['2014-09', 2.35],['2014-10', 2.25], ['2014-11', 2.15], ['2014-12', 2.10],
							['2015-01', 2.10], ['2015-02', 1.95], ['2015-03', 1.90],['2015-04', 1.80], ['2015-05', 1.75], ['2015-06', 1.80],
							['2015-07', 2.05], ['2015-08', 2.15], ['2015-09', 2.10],['2015-10', 2.20]];

	//Bénéfices vs Investissement
	var data_valo = [];

	for (var date in valo) {
		data_valo.push([new Date(date).getTime(), valo[date]]);
	}

	data_valo.sort(function (a, b) {
		return a[0] - b[0];
	});

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

	var series = [
		// Portefeuille
		{      //the value of wallet
			name: 'Portefeuille',
			type: 'spline',
			data: data_valo,
			color: 'rgb(243, 156, 18)',
		},
		// Investissement
		{        //trades of client
			name: 'Investissement',
			data: data_trades,
			type: 'spline',
			color: 'rgba(0, 0, 0, .8)',
			//yAxis: 1,
			dashStyle: 'longdash'
		},
		// Reference ETF FR
		{
			isin: 'FR0010424135',
			type: 'spline',
			name: 'Référence ETF FR',
			tooltip: {
				valueDecimals: 2
			},
			color: 'rgb(91, 173, 255)',
			visible: false
		},
		// Reference ETF US
		{
			isin: 'FR0010168773',
			type: 'spline',
			name: 'Référence ETF US',
			tooltip: {
				valueDecimals: 2
			},
			color: 'rgb(91, 173, 0)',
			visible: false
		},
		// Reference ETF WORLD
		{
			isin: 'FR0010361683',
			type: 'spline',
			name: 'Référence ETF World',
			tooltip: {
				valueDecimals: 2
			},
			color: 'rgba(255, 112, 77, .8)',
			visible: false
		},
		// Reference rate 3%
		{        //the reference of interest 3%
			name: 'Compte-épargne ',
			data: reference_interest(0.03, valo, trades_ca_sto),
			type: 'spline',
			color: 'rgba(255, 12, 77, .8)',
			dashStyle: 'shortdot',
			visible: false
		},
		// Reference house
		{        //the reference of interest 3%
			name: 'Imobilier ',
			data: reference_house(rate_house_month, trades_by_date, data_valo),
			type: 'spline',
			color: 'rgba(130, 12, 77, .8)',
			visible: false
		}
	];

	LoadStockChart(series, '#profits-investment', function (prices) {
		return reference_etf(prices, valo, data_valo, trades_ca_sto);
	});
}

var is_loaded = false;

function load_etf_list(wallet, etfs) {
	var s = 0;
	percents = {};
	var percents_c = {};

	for (var code in wallet.etf) {
		//etfs.push(code);
		s += wallet.etf[code];
	}


	for (var code in wallet.etf) {
		percents[code] = (wallet.etf[code] * 100 / s).toFixed(2);
	}

	for (var i = 0; i < etfs.length; i++) {
		var etf = etfs[i];
		var tr = $("#etf-" + etf.isin);
		var gains = tr.find('.etf-column.gains');

		var gain = (Math.floor(Math.random() * 30) + 2) * (Math.random() < 0.5 ? -1 : 1);

		gains.css('color', gain >= 0 ? "green" : "red")
		gains.find('.percent').html(((gain / etf.quantity / etf.price) * 100).toFixed(2) + "%");
		gains.find('.currency').html(gain + " &euro;");
		gains.find('.number').html(gain);

		tr.find('.etf-column.percents .percent').html(percents[etf.isin] + "%");
		tr.find('.etf-column.percents .currency').html((etf.quantity * etf.price) + "&euro;");
		tr.find('.etf-column.percents .number').html(etf.quantity);
	}

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
}