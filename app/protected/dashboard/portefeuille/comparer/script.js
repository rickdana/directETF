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
			visible: true
		}
	];

	LoadStockChart(series, '#profits-investment', function (prices) {
		return reference_etf(prices, valo, data_valo, trades_ca_sto);
	});
}