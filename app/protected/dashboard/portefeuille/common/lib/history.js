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