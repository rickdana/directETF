angular.module('DirectETF')
    .controller('ComparaisonController', function($ClientFactory, $rootScope, $scope, $http, $EtfsFactory, $element, $ocLazyLoad, ngDialog) {
        $ocLazyLoad.load({
            insertBefore: '#ng_load_plugins_before',
            files: [
                '/protected/pages/dashboard/comparaison/style.css',
                '/protected/pages/dashboard/comparaison/reference.json'
            ]
        });

        $scope.$on('$viewContentLoaded', function () {
            // initialize core components
            App.initAjax();

        });

        $scope.share = function() {
            ngDialog.open({
                template: '<h2 class="text-center">:-(</h2><p class="text-center">Il n\'est pas encore possible de partager une stratégie.</p>',
                plain: true
            });
        };

        // Checkbox
        var checkbox = $element.find('#ref_fis_checkbox');
        var tex_fis =  $element.find('#text-fiscalite');

        $(checkbox).on('change', function() {
            if (this.checked) {
                show_fiscalite ($scope.data.repeatSelect + ' fiscalité');
                tex_fis.show();
            } else {
                hide_fiscalite ($scope.data.repeatSelect + ' fiscalité');
                tex_fis.hide();
            }
        });

        $scope.client.portfolio.prototype.trades(function (err, trades) {
            if (err) {
                throw err;
            }

            $scope.client.portfolio.prototype.tradesByDate(function (err, trades_by_date) {
                if (err) {
                    throw err;
                }

                $http.get('/protected/pages/dashboard/comparaison/reference.json')
                    .success(function (ref_infos) {
                        load_comparaison_valo_trades($scope.client.portfolio.dataValo, trades, trades_by_date, $scope);

                        ref_infos.unshift({
                            "name": "",
                            "data": "",
                            "tax": 0,
                            "text": "Sélectionner un élément de comparaison",
                            "taxText": ""
                        })

                        $scope.data = {
                            repeatSelect: ref_infos[0].name,
                            availableOptions: ref_infos,
                        };

                        $scope.text = function(name) {
                            for (var i in ref_infos) {
                                if(name == ref_infos[i].name) {
                                    return ref_infos[i].text;
                                }
                            }
                        };
                        $scope.taxText = function(name) {
                            for (var i in ref_infos) {
                                if(name == ref_infos[i].name) {
                                    return ref_infos[i].taxText;
                                }
                            }
                        };

                        $scope.$watch(function () {
                            return $scope.data.repeatSelect;
                        }, function () {
                            load_comparaison_reference($scope, $EtfsFactory, $scope.client.portfolio.valo, $scope.client.portfolio.dataValo, trades, $scope.data.repeatSelect, ref_infos, trades_by_date)
                        })

                    })

            });
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = true;
        $rootScope.settings.layout.pageSidebarClosed = false;
    })