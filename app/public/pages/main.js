'use strict';

var DirectETF = angular.module('DirectETF', ['ngRoute', 'oc.lazyLoad']);

/* Configure ocLazyLoader(refer: https://github.com/ocombe/ocLazyLoad) */
DirectETF.config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        // global configs go here
    });
}]);

// Declare app level module which depends on views, and components
DirectETF
    .config(['$routeProvider', function($routeProvider, $ocLazyLoad) {
        $routeProvider
            .when('/accueil', {
                page: {
                    title: "Bienvenue sur DirectETF",
                    description: ""
                },
                templateUrl: 'home/main.html',
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            files: [
                                'home/main.js',
                                'home/style.css',
                            ]
                        });
                    }]
                }
            })
            .when('/essai', {
                page: {
                    title: "Essayer DirectETF",
                    description: ""
                },
                templateUrl: 'essai/main.html',
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            files: [
                                'essai/main.js',
                                'essai/style.css',
                            ]
                        });
                    }]
                }
            })
            .when('/prix', {
                page: {
                    title: "Des frais réduits",
                    description: ""
                },
                templateUrl: 'info/prix.html',
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            files: [
                                'info/main.js',
                                'info/style.css',
                            ]
                        });
                    }]
                }
            })
            .when('/details', {
                page: {
                    title: "Details",
                    description: ""
                },
                templateUrl: 'info/details.html',
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            files: [
                                'info/main.js',
                                'info/style.css',
                            ]
                        });
                    }]
                }
            })
            .when('/securite', {
                page: {
                    title: "Securite",
                    description: ""
                },
                templateUrl: 'info/securite.html',
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            files: [
                                'info/main.js',
                                'info/style.css',
                            ]
                        });
                    }]
                }
            })
            .when('/login', {
                page: {
                    title: "Se connecter",
                    description: ""
                },
                templateUrl: 'login/main.html',
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            files: [
                                'login/main.js',
                                'login/style.css',
                            ]
                        });
                    }]
                }
            })
            .when('/signin', {
                page: {
                    title: "Créer un compte",
                    description: ""
                },
                templateUrl: 'signin/main.html',
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            files: [
                                'signin/main.js',
                                'signin/style.css',
                            ]
                        });
                    }]
                }
            })
            .when('/forget', {
                page: {
                    title: "Retrouver son mot de passe",
                    description: ""
                },
                templateUrl: 'forget/main.html',
                resolve: {
                    deps: ['$ocLazyLoad', function($ocLazyLoad) {
                        return $ocLazyLoad.load({
                            files: [
                                'forget/main.js',
                                'forget/style.css',
                            ]
                        });
                    }]
                }
            })
            .otherwise({redirectTo: '/accueil'})
    }])
    .directive('scrollTo', function () {
        return function(scope, element, attrs) {
            element.bind('click', function(event) {
                event.stopPropagation();

                var off = scope.$on('$locationChangeStart', function(ev) {
                    off();
                    ev.preventDefault();
                });

                $('html, body').stop().animate({
                    scrollTop: ($(attrs.scrollTo).offset().top - $('#mainNav').outerHeight())
                }, 1250, 'easeInOutExpo');
            });
        };
    })
    .run(function($rootScope) {
        $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
            $rootScope.$page = current.$$route.page;

            $('body').removeClass('overlay');

            $('html,body').animate({
                scrollTop: 0
            }, 700);
        });
    })
;
$(document).ready(function() {
    // Highlight the top nav as scrolling occurs
    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 51
    })

    var on_scroll = function() {
        if ($(window).scrollTop() > 99) {
            $('#mainNav').addClass('on-scroll');
        } else {
            $('#mainNav').removeClass('on-scroll');
        }
    };

    on_scroll();
    $(window).scroll(on_scroll);

    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function() {
        $('.navbar-toggle:visible').click();
    });
});