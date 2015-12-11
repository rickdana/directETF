'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', ['ngRoute']).
config(['$routeProvider', function($routeProvider) {
  //$routeProvider.otherwise({redirectTo: '/view1'});
}]);

angular.module('myApp')
    .controller('SlideController', function($scope, $element) {
        $scope.step = 1;
        $scope.next = function() {
            $('#slide' + $scope.step).addClass('fadeOutLeftBig');

            $scope.step = $scope.step + 1;

            //setTimeout(function () {
            //    $scope.step = $scope.step + 1;
            //
            //    $('#slide' + $scope.step).hide();
            //    $('#slide' + $scope.step).show();
            //    $('#slide' + $scope.step).addClass('fadeOutLeftBig');
            //}, 1000)
        };

        $('.box').hide();
        $('#slide1').show();
    });