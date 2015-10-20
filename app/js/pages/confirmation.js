function getSearchParameters() {
    var prmstr = window.location.search.substr(1);
    return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}

function transformToAssocArray( prmstr ) {
  var params = {};
  var prmarr = prmstr.split("&");
  for ( var i = 0; i < prmarr.length; i++) {
      var tmparr = prmarr[i].split("=");
      params[tmparr[0]] = tmparr[1];
  }
  return params;
}

var $_GET = getSearchParameters();

if (typeof $_GET['client'] == 'undefined') {
	$_GET['client'] = 2;
}

$(function () {
	var host = 'http://184.51.42.237:9000';

	// Load client's ETF
	$.getJSON(host + '/client/etfs?id=' + $_GET['client'], function (etfsClient) {
		var etfs = [];
		var s = 0;
		var percents = {};

		for (var code in etfsClient) {
			etfs.push(code);
			s += etfsClient[code];
		}

		for (var code in etfsClient) {
			percents[code] = (etfsClient[code] * 100 / s).toFixed(2);
		}

		// Maps
		$.getJSON(host + '/etfs/by/codes?codes=' + JSON.stringify(etfs),  function (etfs) {
			var data_parsed = [];
			var percents_c = {};

			for (var e in etfs) {
				if (etfs[e].country === 'UK') {
					etfs[e].country = 'GB';
	            }
				if (typeof percents_c[etfs[e].country] == 'undefined') {
					percents_c[etfs[e].country] = 0;
				}
				percents_c[etfs[e].country] += parseFloat(percents[etfs[e].isin]);
			}

			for (var e in etfs) {
				data_parsed.push({
					code: e,
					etfName: etfs[e].name,
					country: etfs[e].country,
					sector: etfs[e].sector,
					value: etfs[e].price,
					p: percents_c[etfs[e].country].toFixed(2),
				});
			}

	        var mapData = Highcharts.geojson(Highcharts.maps['custom/world']);


	        $('#investment-maps').highcharts('Map', {
	            title: {
	                floating: true,
	            	style: {
	                    color: 'rgba(255,255,255,.8)'
	                 },
	                text: "My investment in the World"
	            },
	            exporting: {
	            	enabled: false
	            },

	            legend: {
	                enabled: false
	            },

	            mapNavigation: {
	                enabled: true,
	                buttonOptions: {
	                    verticalAlign: 'bottom'
	                }
	            },

	            tooltip: {
	            	useHTML: true,
	            	pointFormat: '{point.name}: {point.p}%',
	            },

	            series : [{
	                name: 'ETFs by countries',
	                mapData: mapData,
	                color: '#E0E0E0',
	                enableMouseTracking: false
	            }, {
	                type: 'mapbubble',
	                mapData: mapData,
	                name: 'ETF information',
	                joinBy: ['iso-a2', 'country'],
	                data: data_parsed,
	                minSize: 4,
	                maxSize: '12%',
	            }]
	        });

	        var list = $("#summary-table tbody");
			var listFoot = $("#summary-table tfoot");
            var sum = 0;


	        for (var c in etfs) {
//                var line = "<tr>"
//                    + '<td class="etf-column name">' + etfs[c].name + "</td>"
//                    + '<td class="etf-column number">' +etfsClient[etfs[c].isin] + '</td>'
//                    + '<td class="etf-column price">' + etfs[c].price + '&euro;</td>'+
//                   "</tr>";

				sum += etfsClient[etfs[c].isin]*etfs[c].price
//	        	list.append(line);
	        }

			// Sectors
	        var percents_s = {};
			var percents_ = {};
			var s = 0;

			for (var i in etfs) {
				s += etfs[i].number * etfs[i].price;
			}

			for (var i in etfs) {
				percents_[etfs[i].isin] = (etfs[i].number * etfs[i].price * 100 / s).toFixed(2);
			}

			for (var e in etfs) {
				if (typeof percents_s[etfs[e].sector] == 'undefined') {
					percents_s[etfs[e].sector] = 0;
				}
				percents_s[etfs[e].sector] += parseFloat(percents_[etfs[e].isin]);
			}

	        var data_sector = [];

			for (var s in percents_s) {
				data_sector.push({
					name: s,
					y: parseFloat(percents_s[s].toFixed(2))
				});
			}

			data_sector[0].sliced = true;
			data_sector[0].selected = true;

		    // Build the chart
			$('#sectors-overview').highcharts({
				colors: Highcharts.map(Highcharts.getOptions().colors, function (color) {
			        return {
			            radialGradient: {
			                cx: 0.5,
			                cy: 0.3,
			                r: 0.7
			            },
			            stops: [
			                [0, color],
			                [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
			            ]
			        };
			    }),
				chart: {
		            plotBackgroundColor: null,
		            plotBorderWidth: null,
		            plotShadow: false,
		            type: 'pie'
		        },
		        title: {
		            text: null
		        },
	            exporting: {
	            	enabled: false
	            },
		        tooltip: {
		            pointFormat: '{point.percentage:.2f}%'
		        },
		        plotOptions: {
		            pie: {
		                allowPointSelect: true,
		                cursor: 'pointer',
		                dataLabels: {
		                    enabled: false
		                },
		                showInLegend: false
		            }
		        },
		        series: [{
//		            name: "Sectors",
		            colorByPoint: true,
		            data: data_sector
		        }],
		        legend: {
		        	enabled: false
		        }
		    });
		});
	});
});