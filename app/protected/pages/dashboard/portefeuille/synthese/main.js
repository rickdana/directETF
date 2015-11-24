angular.module('MetronicApp')
    .controller('PortefeuilleSyntheseController', function($ClientFactory, $rootScope, $scope) {
        $scope.$on('$viewContentLoaded', function() {
            // initialize core components
            App.initAjax();
        });

        $ClientFactory.wallet(function(wallet) {

            $scope.client = {
                wallet: wallet
            };

            $ClientFactory.valo(function(valo) {

                $ClientFactory.trades(function(trades) {

                    $scope.cbEtfsListLoaded = function(etfs) {
                        load_etf_list(wallet, etfs, valo, trades);
                    };

                    load_wallet(wallet, valo);
                });
            });

        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;
    })