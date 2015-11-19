function load_wallet(wallet, valo) {
	var data_valo = [];
	var total_value = $("#total-value");

	for (var date in valo) {
		data_valo.push([new Date(date).getTime(), valo[date]]);
	}

	data_valo.sort(function (a, b) {
		return a[0] - b[0];
	});

	var num = data_valo[data_valo.length - 1][1].toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
	$("#portefeuille-valeur .number").html(num + ' &euro;');

	var num1 = wallet['dividends']['EUR'].toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' &euro;';
	$("#portefeuille-benefice .number").html(num1);

	$('#investment-list, #maps-repartition, #sectors-overview').attr('filter', JSON.stringify(wallet.etf));
}

function gains_by_etf(isin, wallet, trades, price) {
	var etf_value = 0;
	var etf_quantity = 0;
	var sum_trades = 0;
	var gains = 0;

	for (var code in wallet.etf) {
		if (code == isin) {
			etf_quantity = wallet.etf[code];
			break;
		}
	}

	etf_value = etf_quantity * price;

	for (var i = 0, n = trades.length; i < n; i++) {
		if (trades[i].isin == isin) {
			//BUY, STOCKIN, SELL
			switch (trades[i].type) {

				case 'STOCKIN':
					sum_trades -= trades[i].cash;
					break;

				case 'BUY' :
					sum_trades -= trades[i].cash;
					break;

				case 'SELL':
					sum_trades += trades[i].cash;
			}
		}
	}

	gains = etf_value +	sum_trades;
	return gains;
}

function load_etf_list(wallet, etfs, valo, trades) {
	var s = 0;
	percents = {};
	var data_valo = [];
	var total_value = $("#total-value");
	var total_etfs = $("#total-etfs");
	var gains_wallet = $("#gains-wallet");
	var sum_etfs = 0;
	var sum_gains = 0;

	for (var date in valo) {
		data_valo.push([new Date(date).getTime(), valo[date]]);
	}

	data_valo.sort(function (a, b) {
		return a[0] - b[0];
	});

	total_value.html(data_valo[data_valo.length - 1][1] + " &euro;");

	for (var i = 0; i < etfs.length; i++) {
		var etf = etfs[i];
		var tr = $("#etf-" + etf.isin);
		var gains = tr.find('.etf-column.gains');
		var gain = gains_by_etf(etf.isin, wallet, trades, etf.price);

		sum_etfs += etf.price * etf.quantity;
		sum_gains += gain;
		gains.css('color', gain >= 0 ? "green" : "red");
		gains.html(gain + " &euro;");

	}

	total_etfs.html(sum_etfs + " &euro;");
	gains_wallet.html(sum_gains + " &euro;");
}