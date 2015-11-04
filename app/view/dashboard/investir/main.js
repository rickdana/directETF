'use strict';

angular.module('myApp.investir', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
    $routeProvider
        .when('/investir', {
            templateUrl: 'investir/main.html',
            controller: 'InvestirCtrl'
        });
  }])

  .controller('InvestirCtrl', [function($scope, $routeParams) {
          //$scope.cash = "40 000 &euro;";
  }]);