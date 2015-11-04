'use strict';

angular.module('myApp.portefeuille', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/portefeuille', {
            templateUrl: 'portefeuille/main.html',
            controller: 'PortefeuilleCtrl'
        });
  }])

  .controller('PortefeuilleCtrl', [function($scope, $routeParams) {
          //$scope.cash = "40 000 &euro;";
  }]);