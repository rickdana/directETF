angular.module('MetronicApp')
    .factory('mySharedService', function($rootScope) {
        var sharedService = {};

        sharedService.message = {};

        sharedService.prepForBroadcast = function(msg) {
            this.message = msg;
            this.broadcastItem();
        };

        sharedService.broadcastItem = function() {
            $rootScope.$broadcast('handleBroadcast');
        };

        return sharedService;
    })
    .factory('ServiceBroadcastEtfList', function($rootScope) {
        var sharedService = {};

        sharedService.prepForBroadcast = function(etfs) {
            this.etfs = etfs;
            this.broadcastItem();
        };

        sharedService.broadcastItem = function() {
            $rootScope.$broadcast('handleBroadcastEtfListLoaded');
        };

        return sharedService;
    })
    .directive("ngEtfList",
        function($templateCache, $http, $q, $rootScope, $compile) {
            return {
                controller: "EtfListController",
                templateUrl: "/assets/component/EtfListComponent/template.html",
                link: function($scope, $element, $attrs) {
                    if (typeof $attrs.headerTemplate == 'string') {
                        var table = $element.find('table');

                        if (typeof $templateCache.get($attrs.headerTemplate) == 'undefined') {
                            $q.all([
                                $http.get($attrs.headerTemplate, { cache : $templateCache })
                            ]).then(function(resp) {
                                $rootScope.templateCache = resp
                            })
                        }

                        $scope.$parent.$parent.$watch('templateCache', function(n, o) {
                            if(n) {
//                        console.log('data-header-template-loaded %s - %s=> %s', n, o, $attrs.headerTemplate)
                                table.find('thead').remove();
                                table.find('tbody').before($compile($templateCache.get($attrs.headerTemplate)[1])($scope));
                            }
                        });
                    }

                    // Trigger when number of children changes,
                    // including by directives like ng-repeat
                    $scope.$watch(function() {
                        return $element.attr('filter');
                    }, function() {
                        // Wait for templates to render
                        $scope.$evalAsync(function() {
                            // Finally, directives are evaluated
                            // and templates are renderer here
                            if ($element.attr('filter')) {
                                $element.$EtfsFactory.load($element.attr('filter'), $element.render);
                            }
                        });
                    });
                }
            };
        }
    )

function EtfListController($EtfsFactory, $scope, $element, $attrs, $compile, $http, $q, $rootScope, $templateCache, ServiceBroadcastEtfList) {
    $element.render = function(etfs) {
        $scope.etfs = etfs;
        $attrs.rowTemplate = $attrs.rowTemplate || "/assets/component/EtfListComponent/template-row.html";

        if (typeof $attrs.rowTemplate == 'string') {
            var table = $element.find('table');

            table.find('tbody tr').remove();
            table.find('tbody').html("");

            if (typeof $templateCache.get($attrs.rowTemplate) == 'undefined') {
                $q.all([
                    $http.get($attrs.rowTemplate, { cache : $templateCache })
                ]).then(function(resp) {
                    $rootScope.templateCache = resp
                })

                $scope.$parent.$parent.$watch('templateCache', function(n, o) {
                    if(n) {
                        console.log('data-row-template-loaded %s - %s=> %s', n, o, $attrs.rowTemplate)
                        table.find('tbody').append($compile($templateCache.get($attrs.rowTemplate)[1])($scope));
                    }
                });
            } else {
                console.log('data-row-template-loaded => %s', $attrs.rowTemplate)
                table.find('tbody').append($compile($templateCache.get($attrs.rowTemplate)[1])($scope));
            }
        }

        setTimeout(function() {
            ServiceBroadcastEtfList.prepForBroadcast(etfs);
        }, 500);
    };

    $element.$EtfsFactory = $EtfsFactory;

    if (!$attrs.lazy) {
        $element.$EtfsFactory.load($attrs.filter, $element.render);
    }
}

function EtfItemClickNameController($scope, sharedService) {
    $scope.openPopupInfos = function(etf) {
        sharedService.prepForBroadcast(etf);
    };
}

var PopupInfosController = function($scope, $ocLazyLoad, $element, sharedService) {
    $ocLazyLoad.load({
//        name: 'PopupInfosController',
        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files

        files: [
            '/assets/component/EtfListComponent/style.css',
            '/assets/helper/StockChart.js',
        ]
    });

    var etf_info_box_wrapper = $("#etf-info-box-wrapper")
      , etf_info_box = etf_info_box_wrapper.find('.info-box');

    etf_info_box.css("top", ($('.content-header').height() + 0) + "px");
    etf_info_box.css("left", ($('.content-header').width() / 2) + "px");

    etf_info_box_wrapper.css('display', 'block')
                        .hide()
                        .on('click', function() {
                            $(this).fadeOut('slow');
                            return false;
                        });
    $('#etf-info-box').on('click', function() {
        return false;
    }).find('.btn').click(function() {
        etf_info_box_wrapper.click();
    });

    var maps_wrapper = $element.find('.etf-info-box-maps').first();

//    $('#etf-info-box .scroller').slimScroll({
//        height: '500px',
//        wheelStep: 10,
//        railVisible: true
//    });

    $scope.$on('handleBroadcast', function() {
        $scope.isin = sharedService.message.isin;
        $scope.name = sharedService.message.name;
        $scope.price = sharedService.message.price;

//        maps_wrapper.attr('data-filter-isin', $scope.isin);
//        console.log($scope.isin)
        maps_wrapper.attr('filter', $scope.isin);

        $element.fadeIn('slow');
//        $element.find('#etf-info-box-chart-sectors')

        // TODO load historic price of current etf
        LoadStockChart({
            isin: $scope.isin,
            type: 'spline',
            name: $scope.isin,
            tooltip: {
                valueDecimals: 2
            }
        }, $element.find('#etf-info-box-chart-performance'), undefined, true);
    });
}

EtfListController.$inject = ['$EtfsFactory', '$scope', '$element', '$attrs', '$compile', '$http', '$q', '$rootScope', '$templateCache', 'ServiceBroadcastEtfList'];
EtfItemClickNameController.$inject = ['$scope', 'mySharedService'];
PopupInfosController.$inject = ['$scope', '$ocLazyLoad', '$element', 'mySharedService'];