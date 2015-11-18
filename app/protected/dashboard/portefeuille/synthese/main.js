angular.module('MetronicApp')
    .controller('PortefeuilleSyntheseController', function($ClientFactory, $rootScope, $scope, ServiceBroadcastEtfList) {
        $scope.$on('$viewContentLoaded', function() {
            // initialize core components
            App.initAjax();

            $ClientFactory.wallet(function(wallet) {

                $scope.client = {
                    wallet: wallet
                };

                $ClientFactory.valo(function(valo) {

                    $rootScope.$on('handleBroadcastEtfListLoaded', function() {
                        if (location.hash.search(/\/portefeuille/) == -1) {
                            return;
                        }
                        load_etf_list(wallet, ServiceBroadcastEtfList.etfs, valo);
                    });

                    load_wallet(wallet, valo);
                });

            });
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;
    })