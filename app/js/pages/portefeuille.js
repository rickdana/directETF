//Mise en page
x = ($('#maps').height()-$('#portefeuille').height())/2;
$('#portefeuille .box-body').each(function() {
  $(this).css('height', ($(this).innerHeight() + x) + 'px');
});


//Bénéfices vs Investissement
$('#profits-investment').highcharts({
    chart: {
        type: 'areaspline'
    },
    title: {
        text: null
    },
    exporting: {
    	enabled: false
    },
    legend: {
        layout: 'vertical',
        align: 'left',
        verticalAlign: 'top',
        x: 150,
        y: 100,
        floating: true,
        borderWidth: 1,
        backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'
    },
    xAxis: {
        categories: [
            'Oct.',
            'Nov.',
            'Dec.',
            'Jan.',
            'Feb.',
            'Mar.',
            'Apr.',
            'May',
            'Jun.',
            'Jul.',
            'Aug.',
            'Sept.',
        ],
        plotBands: [{ // visualize the weekend
            from: 0,
            to: 2,
            color: 'rgba(0, 0, 0, .1)',
            label: {
            	text: '2014'
            }
        }],
        lineColor: '#ABA2A2',
    },
    yAxis: {
        title: {
            text: null
        },
    	gridLineColor: '#ABA2A2'
    },
    tooltip: {
        shared: true,
        valuePrefix: '$'
    },
    legend: {
    	enabled: false
    },
    credits: {
        enabled: false
    },
    plotOptions: {
        areaspline: {
            fillOpacity: 0
        }
    },
    series: [{
        name: 'Investment',
        data: [3300, 5460, 4000, 1500, 1236, 3548, 6523, 1236, 6523, 9985, 15600, 12562],
        color: 'rgb(243, 156, 18)'
    }, {
        name: 'Profits',
        data: [6520, 5620, 6200,  980, 1236, 6584, 1236, 3650, 6548, 15630, 25000, 15600],
        color: 'rgb(100, 100, 182)'
    }]
});

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
	        
	        var list = $("#investment-list tbody");

	        for (var c in etfs) {
	        	var flag = "http://files.stevenskelton.ca/flag-icon/flag-icon/svg/country-4x3/" + etfs[c].country.toLowerCase() + ".svg";
				var gain = (Math.floor(Math.random() * 30) + 2) * (Math.random() < 0.5 ? -1 : 1);
	        	var line = "<tr>"
					+ "<td><img class='left z-depth-1' width='' height='21' alt='" + etfs[c].country.toLowerCase() + "' src='" + flag + "'></td>"
	        		+ "<td class='waves-effect waves-light'>" + etfs[c].name + "</td>"
	        		+ "<td>" + etfs[c].sector + "</td>"
	        		+ (gain >= 0 ? "<td style='color:green;'>" : "<td style='color:red;'>")
	        			+"<span class='percent' style='display:none;'>" +  ((Math.abs(gain/etfsClient[etfs[c].isin])/etfs[c].price)*100).toFixed(2) + "%</span>"
                        +"<span class='currency' style='display:none;'>" + gain + "&euro;</span>"
                        +"<span class='number' style='display:inline;'>" + gain + "&euro;</span>"
	        		+ "</td>"
					+ "<td style='text-align:center'>"
						+"<span class='percent' style='display:none;'>" + percents[etfs[c].isin] + "%</span>"
						+"<span class='currency' style='display:none;'>" + (etfsClient[etfs[c].isin]*etfs[c].price) + "&euro;</span>"
						+"<span class='number' style='display:inline;'>" + etfsClient[etfs[c].isin] + "</span>"
					+"</td>"+
				   "</tr>";
	        	
	        	list.append(line);
	        }

			// Sectors
	        var percents_s = {};

			for (var e in etfs) {
				if (typeof percents_s[etfs[e].sector] == 'undefined') {
					percents_s[etfs[e].sector] = 0;
				}
				percents_s[etfs[e].sector] += parseFloat(percents[etfs[e].isin]);
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
		            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
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
		            name: "Sectors",
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

jQuery(document).ready(function(){

		jQuery('.percent-filter').click(function(){
			jQuery('.compo-filter.selected').removeClass('selected');
			jQuery('.percent-filter').addClass('selected');
           	$('.percent').show();
           	$('.number').hide();
           	$('.currency').hide();
        });

		jQuery('.number-filter').click(function(){
			jQuery('.compo-filter.selected').removeClass('selected');
			jQuery('.number-filter').addClass('selected');
			$('.number').show();
			$('.percent').hide();
			$('.currency').hide();
		});

		jQuery('.currency-filter').click(function(){
			jQuery('.compo-filter.selected').removeClass('selected');
			jQuery('.currency-filter').addClass('selected');
			$('.currency').show();
			$('.number').hide();
			$('.percent').hide();
		});

});


