'use strict';

angular.module('DirectETF', [])
    .controller('InfoController', function ($scope, $element) {
        $scope.montant = 15000;
        $scope.chargeInvest = Math.ceil(($scope.montant * 0.036 / 12));
        $scope.chargeProduct = Math.ceil($scope.montant * 0.012 / 12);

        $scope.slider = {
            options: {
                floor: 100,
                ceil: 100000,
                step: 100,
                hideLimitLabels: true,
                showSelectionBar: true,
                translate: function () {
                    return '';
                }
            }
        };

        $scope.$watch(function() {
            return $scope.montant;
        }, function(montant) {
            $scope.chargeInvest = Math.ceil((montant * 0.036 / 12));
            $scope.chargeProduct = Math.ceil(montant * 0.012 / 12);
        });
    });