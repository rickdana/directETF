/***
Metronic AngularJS App Main Script
***/

/* Metronic App */
var MetronicApp = angular.module("MetronicApp", [
    "ui.router", 
    "ui.bootstrap", 
    "oc.lazyLoad",
    "ngSanitize",
]);

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
MetronicApp.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        // global configs go here
    });
}]);

/********************************************
 BEGIN: BREAKING CHANGE in AngularJS v1.3.x:
*********************************************/
/**
`$controller` will no longer look for controllers on `window`.
The old behavior of looking on `window` for controllers was originally intended
for use in examples, demos, and toy apps. We found that allowing global controller
functions encouraged poor practices, so we resolved to disable this behavior by
default.

To migrate, register your controllers with modules rather than exposing them
as globals:

Before:

```javascript
function MyController() {
  // ...
}
```

After:

```javascript
angular.module('myApp', []).controller('MyController', [function() {
  // ...
}]);

Although it's not recommended, you can re-enable the old behavior like this:

```javascript
angular.module('myModule').config(['$controllerProvider', function($controllerProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();
}]);
**/

//AngularJS v1.3.x workaround for old style controller declarition in HTML
MetronicApp.config(['$controllerProvider', function($controllerProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();
}]);

/********************************************
 END: BREAKING CHANGE in AngularJS v1.3.x:
*********************************************/

/* Setup global settings */
MetronicApp.factory('settings', ['$rootScope', function($rootScope) {
    // supported languages
    var settings = {
        layout: {
            pageSidebarClosed: false, // sidebar menu state
            pageContentWhite: true, // set page content layout
            pageBodySolid: false, // solid body color state
            pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
        },
        assetsPath: '/protected/assets',
        globalPath: '/protected/assets/global',
        layoutPath: '/protected/assets/layouts/layout',
    };

    $rootScope.settings = settings;

    return settings;
}]);

/* Setup App Main Controller */
MetronicApp.controller('AppController', ['$scope', '$rootScope', function($scope, $rootScope) {
    $scope.$on('$viewContentLoaded', function() {
        //App.initComponents(); // init core components
        //Layout.init(); //  Init entire layout(header, footer, sidebar, etc) on page load if the partials included in server side instead of loading with ng-include directive
    });
}]);

/***
Layout Partials.
By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial
initialization can be disabled and Layout.init() should be called on page load complete as explained above.
***/

/* Setup Layout Part - Header */
MetronicApp.controller('HeaderController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initHeader(); // init header
    });
}]);

/* Setup Layout Part - Sidebar */
MetronicApp.controller('SidebarController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initSidebar(); // init sidebar
    });
}]);

/* Setup Layout Part - Theme Panel */
MetronicApp.controller('ThemePanelController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Demo.init(); // init theme panel
    });
}]);

/* Setup Layout Part - Footer */
MetronicApp.controller('FooterController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initFooter(); // init footer
    });
}]);

/* Setup Rounting For All Pages */
MetronicApp.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/portefeuille/synthese");

    $stateProvider
        // Portefeuille synthèse
        .state('/protected/pages/dashboard/portefeuille/synthese', {
            url: "/portefeuille/synthese",
            templateUrl: "/protected/pages/dashboard/portefeuille/synthese/main.html",
            data: {pageTitle: 'Synthèse du portefeuille'},
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            '/protected/pages/dashboard/portefeuille/synthese/main.js',
                            '/protected/pages/dashboard/portefeuille/synthese/style.css',
                        ]
                    });
                }]
            }
        })

        // Portefeuille historique
        .state('/protected/pages/dashboard/portefeuille/historique', {
            url: "/portefeuille/historique",
            templateUrl: "/protected/pages/dashboard/portefeuille/historique/main.html",
            data: {pageTitle: 'Historique du portefeuille'},
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            '/protected/assets/lib/StockChart.js',
                            '/protected/pages/dashboard/portefeuille/historique/main.js',
                            '/protected/pages/dashboard/portefeuille/historique/script.js',
                            '/protected/pages/dashboard/portefeuille/historique/style.css',
                        ]
                    });
                }]
            }
        })

        // Portefeuille comparer
        .state('/protected/pages/dashboard/portefeuille/comparer', {
            url: "/portefeuille/comparer",
            templateUrl: "/protected/pages/dashboard/portefeuille/comparer/main.html",
            data: {pageTitle: 'Comparer le portefeuille'},
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            '/protected/pages/dashboard/portefeuille/comparer/style.css',
                            '/protected/assets/lib/StockChart.js',
                            '/protected/pages/dashboard/portefeuille/comparer/main.js',
                            '/protected/pages/dashboard/portefeuille/comparer/script.js',
                        ]
                    });
                }]
            }
        })

        // Investir
        .state('investir', {
            url: "/investir",
            templateUrl: "/protected/pages/dashboard/investir/main.html",
            data: {pageTitle: 'Investir'},
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            '/icheck/skins/flat/blue.css',
                            '/icheck/skins/square/blue.css',
                            '/protected/pages/dashboard/investir/style.css',
                            '/bootstrap-tagsinput/src/bootstrap-tagsinput.css',

                            '/datatables/media/js/jquery.dataTables.min.js',
                            '/datatables/media/js/dataTables.bootstrap.min.js',
                            '/ionrangeslider/js/ion.rangeSlider.min.js',
                            '/icheck/icheck.min.js',
                            '/bootstrap-tagsinput/src/bootstrap-tagsinput.js',

                            '/protected/pages/dashboard/investir/main.js',
                        ]
                    });
                }]
            }
        })

        // Historique
        .state('historique', {
            url: "/historique",
            templateUrl: "/protected/pages/dashboard/historique/main.html",
            data: {pageTitle: 'Historique'},
            controller: "HistoriqueController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            //'/datatables/media/css/dataTables.bootstrap.css',
                            '/datatables/media/css/jquery.dataTables.css',
                            '/datatables/media/js/jquery.dataTables.js',
                            //'/datatables/media/js/dataTables.bootstrap.js',
                            "/protected/pages/dashboard/historique/style.css",
                            "/protected/pages/dashboard/historique/main.js",
                            "/protected/pages/dashboard/historique/script.js",
                        ]
                    });
                }]
            }
        })

        // Historique
        .state('actualites', {
            url: "/actualites",
            templateUrl: "/protected/pages/dashboard/actualites/main.html",
            data: {pageTitle: 'Actualités'},
            controller: "ActualitesController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
                        files: [
                            "/protected/pages/dashboard/actualites/style.css",
                            "/protected/pages/dashboard/actualites/main.js",
                            "/protected/pages/dashboard/actualites/script.js",
                        ]
                    });
                }]
            }
        })

        // AngularJS plugins
        .state('fileupload', {
            url: "/file_upload.html",
            templateUrl: "views/file_upload.html",
            data: {pageTitle: 'AngularJS File Upload'},
            controller: "GeneralPageController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'angularFileUpload',
                        files: [
                            '/protected/assets/global/plugins/angularjs/plugins/angular-file-upload/angular-file-upload.min.js',
                        ] 
                    }, {
                        name: 'MetronicApp',
                        files: [
                            '/protected/pages/dashboard/controllers/GeneralPageController.js'
                        ]
                    }]);
                }]
            }
        })

        // User Profile
        .state("profile", {
            url: "/profile",
            templateUrl: "/protected/pages/dashboard/profile/main.html",
            data: {pageTitle: 'Mon profil'},
            controller: "UserProfileController",
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',  
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '/bootstrap-fileinput/css/fileinput.min.css',
                            '/protected/pages/dashboard/profile/style.css',

                            '/protected/pages/dashboard/profile/UserProfileController.js'
                        ]                    
                    });
                }]
            }
        })

        // User Settings
        .state("profile.settings", {
            url: "/settings",
            templateUrl: "/protected/pages/dashboard/profile/settings/main.html",
            data: {pageTitle: 'Mes préférences'},
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'MetronicApp',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
                            '/protected/pages/dashboard/profile/settings/style.css',
                            '/protected/pages/dashboard/profile/settings/PortfolioSettingsController.js'
                        ]
                    });
                }]
            }
        })

        // User Profile Account
        .state("profile.account", {
            url: "/account",
            templateUrl: "/protected/pages/dashboard/profile/account.html",
            data: {pageTitle: 'Mon compte'}
        })

        // User Billing
        .state("profile.billing", {
            url: "/billing",
            templateUrl: "/protected/pages/dashboard/profile/billing.html",
            data: {pageTitle: 'Carte de crédit'}
        })

        // User Profile Help
        .state("profile.help", {
            url: "/help",
            templateUrl: "/protected/pages/dashboard/profile/help.html",
            data: {pageTitle: 'Aide'}
        })

}]);

/* Init global settings and run the app */
MetronicApp.run(["$rootScope", "settings", "$state", function($rootScope, settings, $state) {
    $rootScope.$state = $state; // state to be accessed from view
    $rootScope.$settings = settings; // state to be accessed from view
}]);