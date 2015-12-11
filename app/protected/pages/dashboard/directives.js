/***
GLobal Directives
***/

// Route State Load Spinner(used on page or content load)
angular.module("MetronicApp").directive('ngSpinnerBar', ['$rootScope',
    function($rootScope) {
        return {
            link: function(scope, element, attrs) {
                // by defult hide the spinner bar
                element.addClass('hide'); // hide spinner bar by default

                // display the spinner bar whenever the route changes(the content part started loading)
                $rootScope.$on('$stateChangeStart', function() {
                    element.removeClass('hide'); // show spinner bar
                });

                // hide the spinner bar on rounte change success(after the content loaded)
                $rootScope.$on('$stateChangeSuccess', function() {
                    element.addClass('hide'); // hide spinner bar
                    $('body').removeClass('page-on-load'); // remove page loading indicator
                    Layout.setSidebarMenuActiveLink('match'); // activate selected link in the sidebar menu
                   
                    // auto scorll to page top
                    setTimeout(function () {
                        App.scrollTop(); // scroll to the top on content load
                    }, $rootScope.settings.layout.pageAutoScrollOnLoad);     
                });

                // handle errors
                $rootScope.$on('$stateNotFound', function() {
                    element.addClass('hide'); // hide spinner bar
                });

                // handle errors
                $rootScope.$on('$stateChangeError', function() {
                    element.addClass('hide'); // hide spinner bar
                });
            }
        };
    }
])
.directive('linkToStcokchart', function() {
    return {
        restrict: 'A',
        link: function($scope, $element, $attrs) {
            var container = $('#' + $element.attr('data-id-container'));

            $scope.isComboSelectPeriode = false;
            $scope.periodeData = ['Select une période', '6 mois', 'Année en cours', 'Un an', 'Toute la période'];
            $scope.periodeSelect = $scope.periodeData[0];

            var options = {
                xAxis: {
                    events: {
                        setExtremes: function (e) {
                            if(!$scope.isComboSelectPeriode) {
                                $scope.$apply(function () {
                                    $scope.periodeSelect = $scope.periodeData[0];
                                });
                            } else {
                                $scope.isComboSelectPeriode = false;
                            }
                        }
                    }
                },
            };

            LoadStockChart({}, container, false, null, options);

            $scope.$watch(function () {
                return $scope.periodeSelect;
            }, function () {
                $scope.updateTimeRange();
            })

            $scope.updateTimeRange = function() {
                var chart = container.highcharts();

                switch($scope.periodeSelect) {
                    case '6 mois':
                        $scope.isComboSelectPeriode = true;
                        chart.rangeSelector.buttons[2].setState(2);
                        chart.rangeSelector.clickButton(2,2,true);
                        break;
                    case 'Année en cours':
                        $scope.isComboSelectPeriode = true;
                        chart.rangeSelector.buttons[3].setState(2);
                        chart.rangeSelector.clickButton(3,3,true);
                        break;
                    case 'Un an':
                        $scope.isComboSelectPeriode = true;
                        chart.rangeSelector.buttons[4].setState(2);
                        chart.rangeSelector.clickButton(4,4,true);
                        break;
                    case 'Toute la période':
                        $scope.isComboSelectPeriode = true;
                        chart.rangeSelector.buttons[5].setState(2);
                        chart.rangeSelector.clickButton(5,5,true);
                        break;
                }

            }
        }
    };
})


// Handle global LINK click
MetronicApp.directive('a', function() {
    return {
        restrict: 'E',
        link: function(scope, elem, attrs) {
            if (attrs.ngClick || attrs.href === '' || attrs.href === '#') {
                elem.on('click', function(e) {
                    e.preventDefault(); // prevent link click for above criteria
                });
            }
        }
    };
});

// Handle Dropdown Hover Plugin Integration
MetronicApp.directive('dropdownMenuHover', function () {
  return {
    link: function (scope, elem) {
      elem.dropdownHover();
    }
  };  
});