angular.module('MetronicApp').controller('ActualitesController', function($rootScope, $scope, $http, $timeout, $ocLazyLoad) {
    $ocLazyLoad.load({
        name: 'MetronicApp',
        insertBefore: '#ng_load_plugins_before',
        files: [
            "/protected/pages/dashboard/actualites/style.css",
        ]
    });

    $scope.$on('$viewContentLoaded', function() {
        // initialize core components
        App.initAjax();
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageContentWhite = true;
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;
});