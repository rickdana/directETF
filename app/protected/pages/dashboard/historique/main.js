angular.module('MetronicApp').controller('HistoriqueController', function( $ClientFactory, $rootScope, $scope, $http, $ocLazyLoad) {
    $scope.$on('$viewContentLoaded', function() {
        // initialize core components

        $ocLazyLoad.load({
            name: 'MetronicApp',
            insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
            files: [

            ]
        });

        App.initAjax();

        $ClientFactory.trades(function(trades) {
            load_user_history (trades);
        });

    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageContentWhite = true;
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;
});