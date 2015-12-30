'use strict';

angular.module('DirectETF', [])
    .controller('EssaiController', function($scope, $element) {
        $('body').addClass('overlay');



        var container = $($element[0]),
            steps = container.find('.steps'),
            prev  = container.find('.prev'),
            next  = container.find('.next');

        var width = container.find('.box').width(),
            limit = container.find('.step').length;

        container.find('.step').each(function(i) {
            $(this)
                .attr('data-step', i + 1)
                .addClass('animated')
                .css({
                    left: width + 'px',
                    right: '-' + width + 'px',
                });
        });

        container.find('label').each(function(i) {
            $(this).click(function() {
                var height = $('[data-step=' + $scope.step + ']').height()
                                + $(this).find('+ .radio-choices').outerHeight();

                steps.css('height', height + 'px');
            });
        });

        $scope.$watch(function() {
            return $scope.step;
        }, function(step, previous) {
            var last = $('[data-step=' + previous + ']'),
                current = $('[data-step=' + step + ']');

            steps.css('height', current.height() + 'px');

            if (step > previous) { // Next
                last
                    .addClass('bounceOutLeft')
                    .removeClass('bounceInRight');
                current
                    .addClass('bounceInRight')
                    .removeClass('bounceOutRight')
                    .css({
                        left: '0px',
                        right: '0px',
                    });
            } else if (step == previous) {
                // Init
                last
                    .addClass('bounceInRight')
                    .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function() {
                        $(this).removeClass('bounceInRight');
                    })
                    .css({
                        left: '0px',
                        right: '0px',
                    });
            } else { // Previous
                last
                    .addClass('bounceOutRight')
                    .removeClass('bounceInRight');
                current
                    .addClass('bounceInLeft')
                    .removeClass('bounceOutLeft')
                    .css({
                        left: '0px',
                        right: '0px',
                    });
            }
        });

        $scope.bar = {
            step: 100 / container.find('.step').length,
            value: 100 / container.find('.step').length
        };

        $scope.step = 1;

        $scope.prev = function() {
            if ($scope.step > 1) {
                $scope.step--;
                $scope.bar.value -= $scope.bar.step;
                prev.removeClass('disabled');
                next.removeClass('disabled');

                if ($scope.step == 1) {
                    prev.addClass('disabled');
                }
            }
        };

        $scope.next = function() {
            if ($scope.step < limit) {
                $scope.step++;
                $scope.bar.value += $scope.bar.step;
                next.removeClass('disabled');
                prev.removeClass('disabled');

                if ($scope.step == limit) {
                    next.addClass('disabled');
                }
            }
        };
    });