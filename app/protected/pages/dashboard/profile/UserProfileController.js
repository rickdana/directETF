angular.module('DirectETF').controller('UserProfileController', function($rootScope, $scope, $ocLazyLoad) {
    $ocLazyLoad.load({
        name: 'DirectETF',
        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
        files: [
            '/protected/pages/dashboard/profile/style.css',
        ]
    });

    $scope.$on('$viewContentLoaded', function() {   
        App.initAjax(); // initialize core components
        Layout.setSidebarMenuActiveLink('set', $('#sidebar_menu_link_profile')); // set profile link active in sidebar menu
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageBodySolid = true;
    $rootScope.settings.layout.pageSidebarClosed = false;
}); 
