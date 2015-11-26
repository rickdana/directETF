angular.module('MetronicApp')
    .controller('PortefeuilleComparerController', function($ClientFactory, $rootScope, $scope) {
        $scope.$on('$viewContentLoaded', function() {
            // initialize core components
            App.initAjax();
        });

        $ClientFactory.portfolio.valo(function(err, valo, data_valo) {
            if (err) {
                throw err;
            }

            $ClientFactory.portfolio.trades(function(err, trades) {
                if (err) {
                    throw err;
                }

                load_comparaison_valo_trades(valo, trades);
            });
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;
    })