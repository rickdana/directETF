'use strict';

angular.module('DirectETF', [])
    .controller('InfoController', function ($scope, $element) {
        $($element[0]).find('.appear').each(function () {
            $($(this).get(0)).bind('appear', function () {
                $(this).addClass($(this).attr('data-animation'));
            });
        });

        $scope.slider = {
            options: {
                floor: 100,
                ceil: 100000,
                interval: 100,
                hideLimitLabels: true,
                showSelectionBar: true,
                translate: function () {
                    return '';
                }
            }
        };
    });