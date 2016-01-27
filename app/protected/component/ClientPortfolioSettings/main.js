angular.module('DirectETF')
    .directive("clientPortfolioSettings",
        function() {
            return {
                controller: "PortfolioSettingsController",
                templateUrl: "/protected/component/ClientPortfolioSettings/template.html"
            };
        }
    )
    .controller('PortfolioSettingsController', function($ocLazyLoad, $ClientFactory, $PortfolioFactory, $rootScope, $scope, $element, $attrs) {
        $ocLazyLoad.load({
            insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
            files: [
                '/protected/component/ClientPortfolioSettings/style.css',
            ]
        });

        $scope.settingInlineDesc = $attrs.settingInlineDesc || false;

        $rootScope.client = {
            portfolio: {
                infos: {
                    goal: {},
                    risk: {},
                }
            }
        };

        $scope.portfolio = {
            prototype: angular.copy($PortfolioFactory.prototype)
        };

        $scope.portfolio.prototype.goal = function(goal) {
            try {
                return $PortfolioFactory.prototype.goal(goal);
            } catch (e) {
                return "";
            }
        };

        $scope.portfolio.prototype.risk = function(goal) {
            try {
                return $PortfolioFactory.prototype.risk(risk);
            } catch (e) {
                return "";
            }
        };

        $ClientFactory.portfolio.infos(function(err, infos) {
            if (err) {
                throw err;
            }

            $scope.client.portfolio.infos = infos;

            // Slider ammount
            $scope.sliderAmmount = {
                options: {
                    floor: 0,
                    ceil: 10000,
                    showSelectionBar: true,
                    hideLimitLabels: true,
                    translate: function(value) {
                        return value + ' ' + $scope.client.portfolio.desc.currencySymb;
                    }
                }
            };

            // Slider Risk init
            var risks = $scope.portfolio.prototype.risks();
            var risks_o = $scope.portfolio.prototype.risks();

            $scope.sliderRisks = {
                value: 0,
                options: {
                    stepsArray: [],
                    showTicks: true
                }
            };

            for (var i = 0; i < risks.length; i++) {
                $scope.sliderRisks.options.stepsArray.push(risks[i].label);

                if (risks[i].level == $scope.client.portfolio.risk) {
                    $scope.sliderRisks.value = i;
                }

                risks_o[risks[i].level] = risks[i].label;
            }

            $scope.$watch(function() {
                return $scope.sliderRisks.value;
            }, function(value) {
                if (risks[value]) {
                    $scope.client.portfolio.risk = risks[value].level;
                    $element.find('.portfolio-risks').attr('data-risk', risks[value].level);
                }
            });
        });
    });
