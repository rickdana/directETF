'use strict';

angular.module('DirectETF', [])
    .controller('HomeController', function($element) {
        $('.navbar-nav > li > a').on('mouseover', function() {
            $(this).addClass('animated flash');
        });

        $('.navbar-nav > li > a').on('mouseout', function() {
            $(this).removeClass('animated flash');
        });

        $('i').on('mouseover', function(){
            $(this).removeClass('bounceIn');
            $(this).addClass('bounce');
        });

        $('i').on('mouseout', function(){
            $(this).removeClass('bounce');
        });

        $($element[0]).find('.appear').each(function() {
            $($(this).get(0)).bind('appear', function () {
                $(this).addClass($(this).attr('data-animation'));
            });
        });

        $($element[0]).find('#try-button').on('click', function() {
            $('header').addClass('overlay');

            //return false;
        })
    });