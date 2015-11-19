angular.module('MetronicApp')
    .controller('PortefeuilleHistoriqueController', function($ClientFactory, $rootScope, $scope, $ocLazyLoad) {
        $scope.$on('$viewContentLoaded', function() {
            $ocLazyLoad.load({
                name: 'MetronicApp',
                insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                files: [
                    '/protected/assets/lib/StockChart.js',
                    '/protected/assets/lib/history.js'
                ]
            });

            // initialize core components
            App.initAjax();

            $ClientFactory.wallet(function(wallet) {
                $ClientFactory.valo(function(valo) {
                    $ClientFactory.trades(function(trades) {
                        load_historique_valo_trades(valo, trades);
                    });
                });
            });
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;
    })