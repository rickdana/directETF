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
    .directive("ngEtfList",
        function($EtfsFactory) {
            return {
                controller: "EtfListController",
                templateUrl: "/protected/component/EtfListComponent/template.html",
                link: function($scope, $element, $attrs) {
                    $element.find('.scroller-zone').slimScroll({
                        height: '500px',
                        wheelStep: 10,
                        railVisible: true
                    });

                    $scope.$watch(function() {
                        return $element.attr('data-filter');
                    }, function(newFilter) {
                        if (newFilter) {
                            $EtfsFactory.load(newFilter, $element.render);
                        }
                    });

                    $attrs.targetScopeName = $attrs.targetScopeName || 'etfs';
                    $scope[$attrs.targetScopeName] = [];
                }
            };
        }
    )
    .directive("etfAttrName",
        function($compile) {
            return {
                restrict: "A",
                link: function($scope, $element, $attrs) {
                    switch ($attrs.etfAttrName) {
                        case 'name':
                            $element.html($compile('<a href="javascript:void(0)" ng-click="openPopupInfos(etf)" \
                                                       data-code="{{etf.isin}}">' + $element.html() + '</a>')($scope));
                            break;
                    }
                }
            };
        }
    )

function EtfListController($EtfsFactory, $scope, $element, $attrs, $compile, $http, $q, $rootScope, $templateCache,
                                 sharedService) {
    $element.render = function(etfs) {
        $scope[$attrs.targetScopeName] = etfs;

        $scope.openPopupInfos = function(etf) {
            sharedService.prepForBroadcast(etf);
        };

        // Table Head
        var tbody = $element.find('table tbody');

        var uid = Math.floor(Math.random() * (100000 - 1 + 1)) + 1
          , varTemplateHeadCacheName = 'templateHeadCache' + uid
          , varTemplateBodyCacheName = 'templateBodyCache' + uid
          , varTemplateFootCacheName = 'templateFootCache' + uid;

        $element.find('table thead').remove();
        $attrs.headerTemplate = $attrs.headerTemplate || "/protected/component/EtfListComponent/template-head.html";

        $q.all([
            $http.get($attrs.headerTemplate, { cache : $templateCache })
        ]).then(function(resp) {
            $rootScope[varTemplateHeadCacheName] = resp;
        });

        $scope.$watch(varTemplateHeadCacheName, function(n, o) {
            if(n) {
                tbody.before($compile($templateCache.get($attrs.headerTemplate)[1])($scope));
            }
        });

        // Table Body Row
        $attrs.rowTemplate = $attrs.rowTemplate || "/protected/component/EtfListComponent/template-row.html";

        tbody.find('tr').remove();
        tbody.html("");

        $q.all([
            $http.get($attrs.rowTemplate, { cache : $templateCache })
        ]).then(function(resp) {
            $rootScope[varTemplateBodyCacheName] = resp;
        })

        $scope.$watch(varTemplateBodyCacheName, function(n, o) {
            if(n) {
                tbody.append($compile($templateCache.get($attrs.rowTemplate)[1])($scope));
            }
        });

        // Table Foot
        if ($attrs.footerTemplate) {
            $element.find('table tfoot').remove();

            $q.all([
                $http.get($attrs.footerTemplate, { cache : $templateCache })
            ]).then(function(resp) {
                $rootScope[varTemplateFootCacheName] = resp;
            });

            $scope.$watch(varTemplateFootCacheName, function(n, o) {
                if(n) {
                    tbody.after($compile($templateCache.get($attrs.footerTemplate)[1])($scope));
                }
            });
        }

        // Emit
        setTimeout(function() {
            if (typeof $attrs.onLoaded == 'string') {
                if (typeof $scope[$attrs.onLoaded] != 'function') {
                    throw new Error('Cannot find callback ' + $attrs.onLoaded + ' in the current $scope!');
                }
            } else {
                if (typeof $scope.cbEtfsListLoaded == 'function') {
                    $attrs.onLoaded = 'cbEtfsListLoaded';
                } else {
                    return;
                }
            }
            $scope[$attrs.onLoaded](etfs);
        }, 500);
    };

    if (!$attrs.lazy || $attrs.filter) {
        $EtfsFactory.load($attrs.filter, $element.render);
    }
}

function PopupInfosController($scope, $ocLazyLoad, $element, sharedService) {
    $ocLazyLoad.load({
        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
        files: [
            '/protected/component/EtfListComponent/style.css',
            '/protected/assets/lib/StockChart.js',
        ]
    });

    var wrapper = $element.parent()
      , box = $element.find('> div');

    box.bind('click', function (e) {
        e.stopPropagation();
    });

    $element.find('.btn').click(function() {
        $element.click();
    });

    $element.css('display', 'block')
            .hide()
            .bind('click', function() {
                $(this).fadeOut('slow');
                return false;
            });

    function onresize() {
        box.css("top", "10%");
        box.css("left", (((wrapper.width() - box.width()) / 2) + $(wrapper.get(0)).offset().left) + "px");
    };

    window.onresize = onresize;

    $scope.$on('handleBroadcast', function() {
        $scope.isin = sharedService.message.isin;
        $scope.name = sharedService.message.name;
        $scope.price = sharedService.message.price;

        $element.find('.update-on-new-isin').attr('data-filter', $scope.isin);

        $element.fadeIn('slow');
        onresize();

        $element.find('.scroller-zone').slimScroll({ scrollTo : '0px' });

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

EtfListController.$inject = ['$EtfsFactory', '$scope', '$element', '$attrs', '$compile', '$http', '$q', '$rootScope',
                             '$templateCache', 'mySharedService'];
PopupInfosController.$inject = ['$scope', '$ocLazyLoad', '$element', 'mySharedService'];