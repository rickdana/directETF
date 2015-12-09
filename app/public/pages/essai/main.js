'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', ['ngRoute']).
config(['$routeProvider', function($routeProvider) {
  //$routeProvider.otherwise({redirectTo: '/view1'});
}]);

$(document).ready(function() {
    $('.navbar-nav > li > a').on('mouseover', function() {
        $(this).addClass('animated flash');
    });

    $('.navbar-nav > li > a').on('mouseout', function() {
        $(this).removeClass('animated flash');
    });

    $('.fa-4x').bind('appear', function () {
        $(this).addClass('bounceIn');
    });

    $('.fa-4x').on('mouseover', function(){
        $(this).removeClass('bounceIn');
        $(this).addClass('bounce');
    });

    $('.fa-4x').on('mouseout', function(){
        $(this).removeClass('bounce');
    });
})