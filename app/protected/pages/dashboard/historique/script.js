
function load_user_history (trades) {


    var table = $('#trades-history tbody');

    for(var i in trades) {
        var ligne = "<tr>"
            + "<td> " + trades[i].date + "</td>"
            + "<td> " + trades[i].comment + "</td>"
            + "<td style='text-align: right'> " + trades[i].cash + " &euro;" + "</td>" +
            "</tr>";
        table.append(ligne);
    }

    $('#trades-history').DataTable( {
        "searching": false,

    });

}