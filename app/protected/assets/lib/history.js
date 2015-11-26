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
function reference_interest( rate, valo, trades ) {
	var evolution = {};
	var ref_interest =[];
	var value_total = 0;
	var start_year = new Date(valo[0][0]).getFullYear();
	var end_year = new Date(valo[valo.length-1][0]).getFullYear() - 1;
	var end_date = new Date(valo[valo.length-1][0]);
	var year = start_year;
	var array_trades = [];


	if( end_date.toLocaleDateString() == '31/12') {
		end_year += 1;
	}

	while ( year <= end_year ) {
		var date = year + "-12-31";
		if(typeof trades[date] == 'undefined') {
			trades[date] = 0;
		}

		year = parseInt(year) + 1;
	}

	for (var date in trades) {
		array_trades.push([date, trades[date]]);
	}

	array_trades.sort(function (a, b) {
		return comparator_date(a[0], b[0]);
	});

	for (var i = 0; i < array_trades.length; i++) {

		value_total += array_trades[i][1];
		var date = array_trades[i][0];


		if ( date.substr(5, 5) == "12-31") {
			value_total *= (1 + rate);
			evolution[date.substr(0, 4) + "-12-31"] = value_total;
		} else {
			evolution[date] = value_total;
		}
	}

	for (var date in evolution) {
		ref_interest.push([new Date(date).getTime(), evolution[date]]);
	}

	ref_interest.sort(function (a, b) {
		return a[0] - b[0];
	});

	return ref_interest;
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

	/*		if (year_in_loop != array_trades[i][0].substr(0,4)) {
				var first_day = array_trades[i][0].substr(0,4) + '-01' + '-01';
				for (var j = 1; j <= calcu_nombre_quinzaine(first_day,
					end_date_string); j++) {
					var solde_last_year = evolution[first_day];
					var interest = solde_last_year *  rate_by_month * j;
					var date_quinzaine = calcu_date_quinzaine(first_day, j);
					evolution[date_quinzaine] = solde_last_year + interest;

				}
				year_in_loop = array_trades[i][0].substr(0,4)
			}*/

			var money_invest = array_trades[i][1];
			var sum = array_trades[i][1] + load_evolution_recent(array_trades[i][0], evolution);
			evolution[array_trades[i][0]] = sum;

			for (var j = 1; j <= calcu_nombre_quinzaine(array_trades[i][0], end_date_string); j++) {
				var interest = money_invest *  rate_by_month * j;
				var date_quinzaine = calcu_date_quinzaine(array_trades[i][0], j);
				if (typeof evolution[date_quinzaine] =='undefined') {
					evolution[date_quinzaine] = sum + interest;
				} else {
					evolution[date_quinzaine] +=  (money_invest+ interest);
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

		console.log(JSON.stringify((evolution)))
		ref_livret.sort(function (a, b) {
			return a[0] - b[0];
		});
		console.log(JSON.stringify((ref_livret)))
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
function get_amount_month( trades_by_date, time ) {
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
function reference_house( rates, trades_by_date, valo_wallet ) {
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