/***
Metronic AngularJS App Main Script
***/

/* Metronic App */
var DirectETF = angular.module("DirectETF", [
    "ui.router",
    "rzModule",
    "ui.bootstrap", 
    "oc.lazyLoad",
    "ngSanitize",
    "ngDialog",
]);

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
DirectETF.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
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
DirectETF.config(['$controllerProvider', function($controllerProvider) {
  // this option might be handy for migrating old apps, but please don't use it
  // in new ones!
  $controllerProvider.allowGlobals();
}]);

/********************************************
 END: BREAKING CHANGE in AngularJS v1.3.x:
*********************************************/

/* Setup global settings */
DirectETF.factory('settings', ['$rootScope', function($rootScope) {
    // supported languages
    var settings = {
        layout: {
            pageSidebarClosed: false, // sidebar menu state
            pageContentWhite: true, // set page content layout
            pageBodySolid: false, // solid body color state
            pageAutoScrollOnLoad: 1000 // auto scroll to top on page load
        },
        assetsPath: '/public/assets',
        globalPath: '/public/assets/global',
        layoutPath: '/protected/assets/layouts/layout',
    };

    $rootScope.settings = settings;

    return settings;
}]);

/* Setup App Main Controller */
DirectETF.controller('AppController', function($rootScope, $ClientFactory, ngDialog) {
    // Load the current client and his portfolio
    $ClientFactory.current(function(err, client) {
        if (err) {
            return console.error(err);
        }

        $rootScope.client = client;
    });

    $rootScope.newsletter = {
        open: function() {
            ngDialog.open({
                template: '<img src="/protected/assets/newsletter/december.jpg">',
                plain: true
            });
        }
    };
});

/***
Layout Partials.
By default the partials are loaded through AngularJS ng-include directive. In case they loaded in server side(e.g: PHP include function) then below partial
initialization can be disabled and Layout.init() should be called on page load complete as explained above.
***/

/* Setup Layout Part - Header */
DirectETF.controller('HeaderController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initHeader(); // init header
    });
}]);

/* Setup Layout Part - Sidebar */
DirectETF.controller('SidebarController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initSidebar(); // init sidebar
    });
}]);

/* Setup Layout Part - Footer */
DirectETF.controller('FooterController', ['$scope', function($scope) {
    $scope.$on('$includeContentLoaded', function() {
        Layout.initFooter(); // init footer
    });
}]);

/* Setup Rounting For All Pages */
DirectETF.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/portefeuille");

    $stateProvider
        // Portefeuille synthèse
        .state('/protected/pages/dashboard/portefeuille', {
            url: "/portefeuille",
            templateUrl: "/protected/pages/dashboard/portefeuille/main.html",
            data: {pageTitle: 'Synthèse du portefeuille'},
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'DirectETF',
                        insertBefore: '#ng_load_plugins_before',
                        files: [
                            '/protected/pages/dashboard/portefeuille/main.js',
                        ]
                    });
                }]
            }
        })

        // Portefeuille comparer
        .state('/protected/pages/dashboard/comparaison', {
            url: "/comparaison",
            templateUrl: "/protected/pages/dashboard/comparaison/main.html",
            data: {pageTitle: 'Outil de comparaison'},
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        insertBefore: '#ng_load_plugins_before',  
                        files: [
                            '/protected/pages/dashboard/comparaison/main.js',
                            '/protected/pages/dashboard/comparaison/script.js'
                        ],
                        name: 'DirectETF'
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
                        name: 'DirectETF',
                        insertBefore: '#ng_load_plugins_before',  
                        files: [
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
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'DirectETF',
                        insertBefore: '#ng_load_plugins_before',  
                        files: [
                            "/protected/pages/dashboard/historique/main.js",

                        ]
                    });
                }]
            }
        })

        // Actualites
        .state('actualites', {
            url: "/actualites",
            templateUrl: "/protected/pages/dashboard/actualites/main.html",
            data: {pageTitle: 'Actualités'},
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'DirectETF',
                        insertBefore: '#ng_load_plugins_before',  
                        files: [
                            "/protected/pages/dashboard/actualites/main.js",
                        ]
                    });
                }]
            }
        })

        // User Profile
        .state("profile", {
            url: "/profile",
            templateUrl: "/protected/pages/dashboard/profile/main.html",
            data: {pageTitle: 'Mon profil'},
            resolve: {
                deps: ['$ocLazyLoad', function($ocLazyLoad) {
                    return $ocLazyLoad.load({
                        name: 'DirectETF',
                        insertBefore: '#ng_load_plugins_before', // load the above css files before '#ng_load_plugins_before'
                        files: [
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
            data: {pageTitle: 'Mes préférences'}
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
DirectETF.run(["$rootScope", "settings", "$state", function($rootScope, settings, $state) {
    $rootScope.$state = $state; // state to be accessed from view
    $rootScope.$settings = settings; // state to be accessed from view
}]);