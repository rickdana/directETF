angular.module('DirectETF').controller('HistoriqueController', function( $ClientFactory, $rootScope, $scope, $http, $ocLazyLoad) {
    $ocLazyLoad.load({
        name: 'DirectETF',
        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
        files: [
            '/datatables/media/css/jquery.dataTables.css',
            '/datatables/media/js/jquery.dataTables.js',
            "/protected/pages/dashboard/historique/style.css",
        ]
    });

    $scope.$on('$viewContentLoaded', function() {

        // initialize core components
        App.initAjax();
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
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;
});