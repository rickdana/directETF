// Declare app level module which depends on views, and components
angular.module('myApp', [
        'ngRoute',
        'myApp.overview',
        'myApp.investir',
        'myApp.portefeuille',
        'ngLoadScript'
    ])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .otherwise('/portefeuille');
        }]);
