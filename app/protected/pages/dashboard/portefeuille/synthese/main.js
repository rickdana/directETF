angular.module('MetronicApp')
    .controller('PortefeuilleSyntheseController', function($ClientFactory, $rootScope, $scope, $element) {
        $scope.$on('$viewContentLoaded', function() {
            // initialize core components
            App.initAjax();
        });

        // Fonction de formatage des prices
        $scope.format = function(number) {
            return parseFloat(number).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        };

        // Exposition initiale
        $scope.client = {
            portfolio: {
                value: 0,
                gains: 0,
                totalEtfs: 0,
            }
        };

        // Chargement des gains de chaque ETF avant l'affichage du tableau des titres
        $scope.cbEtfsListBeforeRendering = function(etfs, done) {
            $ClientFactory.portfolio.etfs(function(err, etfs_with_gains) {
                if (err) {
                    return console.error(err);
                }


                done(etfs_with_gains);
            });
        };

        // Changement des couleurs en fonction des gains
        $scope.cbEtfsListLoaded = function(etfs) {
            $element.find('.etf-column.gains .gain-loss').each(function() {
                $(this).css('color', parseFloat($(this).text()) >= 0 ? "green" : "red");
            });
        };

        // Description du portefeuille (dividentes)
        $ClientFactory.portfolio.infos(function(err, infos) {
            if (err) {
                return console.error(err);
            }

            for (var property in infos) {
                $scope.client.portfolio[property] = infos[property];
            }
        });

        // Valeur du portefeuille
        $ClientFactory.portfolio.value(function(err, value) {
            if (err) {
                return console.error(err);
            }

            $scope.client.portfolio.value = value;
        });

        // Gains totals
        $ClientFactory.portfolio.gains(function(err, gains) {
            if (err) {
                return console.error(err);
            }

            $scope.client.portfolio.gains = gains;
        });

        // Total des titres
        $ClientFactory.portfolio.etfsValue(function(err, etfsValue) {
            if (err) {
                return console.error(err);
            }

            $scope.client.portfolio.etfsValue = etfsValue;
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = true;
        $rootScope.settings.layout.pageSidebarClosed = false;
    })
    .controller('PortefeuilleHistoriqueController', function($ClientFactory, $rootScope) {
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

            LoadStockChart(series, $('#portefeuille-synthese-stockchart'), true);

            var chart =  $('#portefeuille-synthese-stockchart').highcharts();
            chart.rangeSelector.buttons[4].setState(2);
            chart.rangeSelector.clickButton(4,4,true);

        }

        $ClientFactory.portfolio.valo(function(err, valo, data_valo) {
            if (err) {
                throw err;
            }

            $ClientFactory.portfolio.trades(function(err, trades) {
                if (err) {
                    throw err;
                }

                load_historique_valo_trades(valo, trades);
            });
        });
    })