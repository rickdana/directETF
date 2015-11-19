function load_valo_trades(valo, trades) {
	var invests_by_date = {};
	var data_trades = [];
	var trades_by_date = {};
	var somme_trades = 0;
	var trades_ca_sto = {};

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
		}
	];

	LoadStockChart(series, '#profits-investment', function (prices) {
		return reference_etf(prices, valo, data_valo, trades_ca_sto);
	});
}