angular.module('MetronicApp')
    .controller('PortefeuilleSyntheseController', function($ClientFactory, $rootScope, $scope, $element, $ocLazyLoad) {
        $ocLazyLoad.load({
            insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
            files: [
                '/protected/pages/dashboard/portefeuille/synthese/style.css',
            ]
        });

        $scope.$on('$viewContentLoaded', function() {
            // initialize core components
            App.initAjax();
        });

        // Affichage/cahe les tableaux de liste de etfs, historique
        $scope.affTableHistorique = function() {
            $element.find('#portfolio').hide();
            $element.find('#graph-synthese').hide();
            $element.find('#table-synthese').show();
        };

        $scope.cacheTableHistorique = function() {
            $element.find('#portfolio').show();
            $element.find('#graph-synthese').show();
            $element.find('#table-synthese').hide();
        };

        $scope.affListeETFs = function() {
            $element.find('#sector').hide();
            $element.find('#maps').hide();
            $element.find('#list-etfs').show();
        };

        $scope.cacheListeETFs = function() {
            $element.find('#sector').show();
            $element.find('#maps').show();
            $element.find('#list-etfs').hide();
        };

        var btn_portfolio = $element.find('#btn-portfolio'),
            portfolio =  $element.find('#portfolio'),
            btn_liste_etfs = $element.find('#btn-liste-etfs'),
            btn_pie_etfs = $element.find('#btn-pie-etfs'),
            sector =  $element.find('#sector'),
            maps =  $element.find('#maps'),
            liste_etfs =  $element.find('#list-etfs');

        // Fonction de formatage des prices
        $scope.format = function(number) {
            return parseFloat(number).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
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
                $(this).css('color', parseFloat($(this).text()) >= 0 ? "#38cf63" : "red");
            });
        };


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

        //Historique des transactions
        $ClientFactory.portfolio.trades(function(err, trades) {
            if (err) {
                throw err;
            }

            $scope.client.portfolio.trades = trades;

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
                    type: 'spline',
                    data: data_valo,
                    color: 'rgb(255, 255, 255)',
                },
                // Investissement
                {        //trades of client
                    name: 'Investissement',
                    data: data_trades,
                    type: 'spline',
                    color: 'rgb(255, 255, 255)',
                    dashStyle: 'ShortDot'
                }
            ];

            LoadStockChart(series, $('#portefeuille-historique-stockchart'), true);

            var chart =  $('#portefeuille-historique-stockchart').highcharts();
            chart.rangeSelector.buttons[0].setState(2);
            chart.rangeSelector.clickButton(0,0,true);

            chart.xAxis[0].update({
                tickColor:'transparent',
                lineColor: 'transparent',
                lineWidth: 0,
                labels: {
                    style: {
                        color: 'rgb(255, 255, 255)',
                    },
                }
            });

            chart.yAxis[0].update({
                lineColor: 'transparent',
                labels: {
                    style: {
                        color: 'rgb(255, 255, 255)',
                    }
                }
            });


            chart.legend.allItems[0].legendGroup.attr({
                translateY: 22
            });
            chart.legend.allItems[1].legendGroup.attr({
                translateY: 22
            });
            //chart.legend.setText({
            //    styles: {
            //        fill: 'rgb(255, 255, 255)'
            //    }
            //});



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