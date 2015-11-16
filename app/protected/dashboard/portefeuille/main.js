angular.module('MetronicApp')
    .controller('PortefeuilleController', function($ClientFactory, $rootScope, $scope, $ocLazyLoad, ServiceBroadcastEtfList) {
        $scope.$on('$viewContentLoaded', function() {
            $ocLazyLoad.load({
                name: 'MetronicApp',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                    '/assets/helper/StockChart.js',
                ]
            });

            // initialize core components
            App.initAjax();

            $ClientFactory.wallet(function(wallet) {
                $rootScope.$on('handleBroadcastEtfListLoaded', function() {
                    if (location.hash.search(/\/portefeuille/) == -1) {
                        return;
                    }
                    load_etf_list(wallet, ServiceBroadcastEtfList.etfs);
                });

                load_wallet(wallet);

                $ClientFactory.valo(function(valo) {
                    $ClientFactory.trades(function(trades) {
                        load_valo_trades(valo, trades);
                    });
                });
            });
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;
    })