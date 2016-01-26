angular.module('DirectETF')
    .directive("etfList", function() {
        return {
            transclude: true,
            controller: "EtfListController",
            templateUrl: "/protected/component/EtfListComponent/template.html",
        };
    })
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
    .controller('EtfListController', function($EtfsFactory, $rootScope, $scope, $element, $attrs, $compile, $http, $q, $templateCache) {
        $attrs.template = $attrs.template || "/protected/component/EtfListComponent/table.html";

        var render = function(etfs) {
            $scope.etfs = etfs;


            $scope.percent = ((1 / etfs.length) * 100).toFixed(2);

            $q.all([
                $http.get($attrs.template, { cache : $templateCache })
            ]).then(function(templateCache) {
                $element.find('.etf-list-component-table').html($compile($templateCache.get($attrs.template)[1])($scope));

                // Emit
                if ($scope.afterRendering) {
                    if (typeof $scope.afterRendering != 'function') {
                        throw new Error('Cannot find callback beforeRendered in the current $scope!');
                    }

                    setTimeout(function() {
                        $scope.afterRendering(etfs);
                    }, 500);
                }
            });
        };

        $scope.$watch(function() {
            return $attrs.model;
        }, function(filter) {
            if (!filter) {
                return;
            }

            if (filter.length < 3) {
                filter = $rootScope.client.portfolio.etfs;
            }

            $EtfsFactory.load(filter, function(etfs) {
                if ($scope.beforeRendering) {
                    if (typeof $scope.beforeRendering != 'function') {
                        throw new Error('Cannot find callback beforeRendering in the current $scope!');
                    }

                    $scope.beforeRendering(etfs, function(etfs) {
                        render(etfs);
                    });
                } else if (typeof $scope.cbEtfsListBeforeRendering == 'function') {
                    $scope.cbEtfsListBeforeRendering(etfs, function(etfs) {
                        render(etfs);
                    });
                } else {
                    render(etfs);
                }
            });
        });
    })
    .controller('PopupInfosController', function($EtfsFactory, $scope, $ocLazyLoad, $element) {
        $ocLazyLoad.load({
            insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
            files: [
                '/protected/component/EtfListComponent/style.css',
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

        $scope.$parent.openPopupInfos = function(etf) {
            $scope.etf = etf;

            $element.fadeIn('slow');
            onresize();

            $element.find('.scroller-zone').slimScroll({ scrollTo : '0px' });

            $EtfsFactory.prices(etf.isin, function(err, prices) {
                if (err) {
                    throw err;
                }

                LoadStockChart({
                    type: 'spline',
                    name: etf.isin,
                    tooltip: {
                        valueDecimals: 2
                    },
                    data: $EtfsFactory.toUTC(prices)
                }, $element.find('.etf-info-box-chart-performance'), true);
            })
        };
    });