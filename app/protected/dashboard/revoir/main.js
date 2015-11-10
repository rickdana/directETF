'use strict';

angular.module('myApp.revoir', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/revoir', {
            templateUrl: 'revoir/main.html',
            controller: 'RevoirCtrl'
        });
  }])

  .controller('RevoirCtrl', [function($scope, $routeParams) {
          //$scope.cash = "40 000 &euro;";
  }]);