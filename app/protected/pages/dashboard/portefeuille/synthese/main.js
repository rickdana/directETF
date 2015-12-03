angular.module('MetronicApp')
    .controller('PortefeuilleSyntheseController', function($ClientFactory, $rootScope, $scope, $element) {
        $scope.$on('$viewContentLoaded', function() {
            // initialize core components
            App.initAjax();
        });

        // Fonction de formatage des prices
        $scope.format = function(number) {
            return parseFloat(number).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
        };

        // Exposition initiale
        $scope.client = {
            portfolio: {
                value: 0,
                gains: 0,
                totalEtfs: 0,
            }
        };

        // Chargement des gains de chaque ETF avant l'affichage du tableau des titres
        $scope.cbEtfsListBeforeRendering = function(etfs, done) {
            $ClientFactory.portfolio.etfs(function(err, etfs_with_gains) {
                if (err) {
                    return console.error(err);
                }

                done(etfs_with_gains);
            });
        };

        // Changement des couleurs en fonction des gains
        $scope.cbEtfsListLoaded = function(etfs) {
            $element.find('.etf-column.gains .gain-loss').each(function() {
                $(this).css('color', parseFloat($(this).text()) >= 0 ? "green" : "red");
            });
        };

        // Description du portefeuille (dividentes)
        $ClientFactory.portfolio.infos(function(err, infos) {
            if (err) {
                return console.error(err);
            }

            for (var property in infos) {
                $scope.client.portfolio[property] = infos[property];
            }
        });

        // Valeur du portefeuille
        $ClientFactory.portfolio.value(function(err, value) {
            if (err) {
                return console.error(err);
            }

            $scope.client.portfolio.value = value;
        });

        // Gains totals
        $ClientFactory.portfolio.gains(function(err, gains) {
            if (err) {
                return console.error(err);
            }

            $scope.client.portfolio.gains = gains;
        });

        // Total des titres
        $ClientFactory.portfolio.etfsValue(function(err, etfsValue) {
            if (err) {
                return console.error(err);
            }

            $scope.client.portfolio.etfsValue = etfsValue;
        });

        // set sidebar closed and body solid layout mode
        $rootScope.settings.layout.pageContentWhite = true;
        $rootScope.settings.layout.pageBodySolid = false;
        $rootScope.settings.layout.pageSidebarClosed = false;
    })