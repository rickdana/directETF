function load_historique_valo_trades(valo, trades) {
	var invests_by_date = {};
	var data_trades = [];
	var trades_by_date = {};
	var somme_trades = 0;
	var trades_cash_stockin = {};

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
			type: 'area',
			data: data_valo,
			color: 'rgb(50, 197, 210)',
			fillOpacity: 0.2
		},
		// Investissement
		{        //trades of client
			name: 'Investissement',
			data: data_trades,
			type: 'area',
			color: 'rgb(111, 111, 119)',
			fillOpacity: 0.15,
		}
	];

	LoadStockChart(series, $('#portefeuille-historique-stockchart'), true);

	var chart =  $('#portefeuille-historique-stockchart').highcharts();
	chart.rangeSelector.buttons[4].setState(2);
	chart.rangeSelector.clickButton(4,4,true);


}