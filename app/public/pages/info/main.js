'use strict';

angular.module('DirectETF', [])
    .controller('InfoController', function($element) {


        $($element[0]).find('.appear').each(function() {
            $($(this).get(0)).bind('appear', function () {
                $(this).addClass($(this).attr('data-animation'));
            });
        });


    });