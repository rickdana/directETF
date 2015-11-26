angular.module('MetronicApp')
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
                            $EtfsFactory.load(newFilter, $element.onLoaded);
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
    .controller('EtfListController', function($EtfsFactory, $scope, $element, $attrs, $compile, $http, $q, $rootScope, $templateCache) {
        $element.onLoaded = function(etfs) {
            if (typeof $attrs.onBeforeRendering == 'string') {
                if (typeof $scope[$attrs.onBeforeRendering] != 'function') {
                    throw new Error('Cannot find callback ' + $attrs.onBeforeRendering + ' in the current $scope!');
                }

                $scope[$attrs.onBeforeRendering](etfs, function() {
                    //render(etfs);
                });
            } else if (typeof $scope.cbEtfsListBeforeRendering == 'function') {
                $scope.cbEtfsListBeforeRendering(etfs, function(etfs) {
                    render(etfs);
                });
            } else {
                render(etfs);
            }
        };

        function render(etfs) {
            //$scope[$attrs.targetScopeName] = etfs;
            $scope.etfs = etfs;

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
                if (typeof $attrs.onRendered == 'string') {
                    if (typeof $scope[$attrs.onRendered] != 'function') {
                        throw new Error('Cannot find callback ' + $attrs.onRendered + ' in the current $scope!');
                    }
                } else {
                    if (typeof $scope.cbEtfsListLoaded == 'function') {
                        $attrs.onRendered = 'cbEtfsListLoaded';
                    } else {
                        return;
                    }
                }
                $scope[$attrs.onRendered](etfs);
            }, 500);
        }

        if (!$attrs.lazy || $attrs.filter) {
            $EtfsFactory.load($attrs.filter, $element.onLoaded);
        }
    })
    .controller('PopupInfosController', function($scope, $ocLazyLoad, $element) {
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

        $scope.$parent.openPopupInfos = function(etf) {
            $scope.etf = etf;

            $element.fadeIn('slow');
            onresize();

            $element.find('.scroller-zone').slimScroll({ scrollTo : '0px' });

            LoadStockChart({
                isin: etf.isin,
                type: 'spline',
                name: etf.isin,
                tooltip: {
                    valueDecimals: 2
                }
            }, $element.find('.etf-info-box-chart-performance'), undefined, true);
        };
    });