angular.module('MetronicApp')
    .factory('$LoaderFactory', function() {
        function gains_by_etf(etf, trades) {
        	var sum_trades = etf.quantity * etf.price;

        	for (var i = 0, n = trades.length; i < n; i++) {
        		if (trades[i].isin == etf.isin) {
        			// BUY, STOCKIN, SELL
        			switch (trades[i].type) {
        				case 'BUY' :
        				case 'STOCKIN':
        					sum_trades -= trades[i].cash;
        					break;

                        case 'SELL':
                            sum_trades += trades[i].cash;
        					break;
        			}
        		}
        	}

        	return sum_trades;
        }

        // Portofolio value
        function compute_portofolio_valo(valo) {
            var data_valo = [];

            for (var date in valo) {
                data_valo.push([new Date(date).getTime(), valo[date]]);
            }

            data_valo.sort(function (a, b) {
                return a[0] - b[0];
            });

            return data_valo[data_valo.length - 1][1];
        }

        return function(etfs, valo, trades) {
        	var sum_etfs = 0;
        	var sum_gains = 0;

        	for (var i = 0; i < etfs.length; i++) {
        		var etf = etfs[i];
        		var tr = $("#etf-" + etf.isin);
        		var gains = tr.find('.etf-column.gains');
        		var gain = gains_by_etf(etf, trades);

        		sum_etfs += etf.price * etf.quantity;
        		sum_gains += gain;

        		gains.css('color', gain >= 0 ? "green" : "red");
        		gains.html(gain.toFixed(2) + " &euro;");
        	}

        	return {
        	    totalEtfs: sum_etfs,
        	    gains: sum_gains,
        	    portofolioValue: compute_portofolio_valo(valo)
        	};
        };
    })
    .controller('PortefeuilleSyntheseController', function($ClientFactory, $rootScope, $scope, $LoaderFactory) {
        $scope.$on('$viewContentLoaded', function() {
            // initialize core components
            App.initAjax();
        });

        $ClientFactory.portofolio(function(portofolio) {
            $scope.format = function(number) {
                return parseFloat(number).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
            };

            portofolio.value = 0;
            portofolio.gains = 0;
            portofolio.currencySymb = portofolio.currency == 'EUR' ? '€' : '$';

            $scope.client = {
                portofolio: portofolio
            };

            $ClientFactory.valo(function(valo) {
                $ClientFactory.trades(function(trades) {
                    $scope.cbEtfsListLoaded = function(etfs) {
                        var results = $LoaderFactory(etfs, valo, trades);

                        $scope.$apply(function() {
                            $scope.client.portofolio.gains = results.gains;
                            $scope.client.portofolio.totalEtfs = results.totalEtfs;
                            $scope.client.portofolio.value = results.portofolioValue;
                        });
                    };
                });
            });

        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;
    })