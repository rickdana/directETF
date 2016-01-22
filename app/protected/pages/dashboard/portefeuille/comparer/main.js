angular.module('MetronicApp')
    .controller('PortefeuilleComparerController', function($ClientFactory, $rootScope, $scope, $http, $EtfsFactory, $element, $ocLazyLoad, ngDialog) {
        $ocLazyLoad.load({
            insertBefore: '#ng_load_plugins_before',
            files: [
                '/protected/pages/dashboard/portefeuille/comparer/style.css',
                '/protected/pages/dashboard/portefeuille/comparer/reference.json'
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

        $ClientFactory.portfolio.valo(function (err, valo, data_valo) {
            if (err) {
                throw err;
            }

            $ClientFactory.portfolio.trades(function (err, trades) {
                if (err) {
                    throw err;
                }

                $ClientFactory.portfolio.tradesByDate(function (err, trades_by_date) {
                    if (err) {
                        throw err;
                    }

                    $http.get('/protected/pages/dashboard/portefeuille/comparer/reference.json')
                        .success(function (ref_infos) {
                            load_comparaison_valo_trades(data_valo, trades, trades_by_date, $scope);

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
                                load_comparaison_reference($scope, $EtfsFactory, valo, data_valo, trades, $scope.data.repeatSelect, ref_infos, trades_by_date)
                            })

                        })

                });

            });




            // set sidebar closed and body solid layout mode
            $rootScope.settings.layout.pageContentWhite = true;
            $rootScope.settings.layout.pageBodySolid = false;
            $rootScope.settings.layout.pageSidebarClosed = false;
        })
    })