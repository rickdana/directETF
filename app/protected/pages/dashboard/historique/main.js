angular.module('MetronicApp').controller('HistoriqueController', function( $ClientFactory, $rootScope, $scope, $http, $ocLazyLoad) {
    $ocLazyLoad.load({
        name: 'MetronicApp',
        insertBefore: '#ng_load_plugins_before', // load the above css files before a LINK element with this ID. Dynamic CSS files must be loaded between core and theme css files
        files: [
            '/datatables/media/css/jquery.dataTables.css',
            '/datatables/media/js/jquery.dataTables.js',
            "/protected/pages/dashboard/historique/style.css",
        ]
    });

    $scope.$on('$viewContentLoaded', function() {

        // initialize core components

        App.initAjax();


    });


    $ClientFactory.portfolio.trades(function(err, trades) {
        if (err) {
            throw err;
        }

        var table = $('#trades-history tbody');

        for(var i in trades) {
            var ligne = "<tr>"
                + "<td> " + trades[i].date + "</td>"
                + "<td> " + trades[i].comment + "</td>"
                + "<td style='text-align: right'> " + trades[i].cash + " &euro;" + "</td>" +
                "</tr>";
            table.append(ligne);
        }

/*        $('#trades-history').DataTable( {
            "searching": false,

        });*/
    });

    // set sidebar closed and body solid layout mode
    $rootScope.settings.layout.pageContentWhite = true;
    $rootScope.settings.layout.pageBodySolid = false;
    $rootScope.settings.layout.pageSidebarClosed = false;
});