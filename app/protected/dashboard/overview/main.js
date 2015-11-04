'use strict';

angular.module('myApp.overview', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/overview', {
            templateUrl: 'overview/main.html',
            controller: 'OverviewCtrl'
        });
  }])

  .controller('OverviewCtrl', [function($scope, $routeParams) {
          //$scope.cash = "40 000 &euro;";
  }]);