angular.module('MetronicApp')
    .controller('PortfolioSettingsController', function($PortfolioFactory, $scope) {

        $PortfolioFactory.goals(function(err, goals) {
            if (err) {
                throw err;
            }

            $scope.portfolio = {
                goals: goals
            };

            console.log($scope.portfolio)
        })

    });
