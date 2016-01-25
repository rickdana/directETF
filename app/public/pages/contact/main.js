'use strict';

angular.module('DirectETF', [])
    .controller('ContactController', function ($scope, $element) {
        $scope.model = {
            name: '',
            email: '',
            subject: '',
            message: '',
        };

        $scope.send = function() {

        };
    });