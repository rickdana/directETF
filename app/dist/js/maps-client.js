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
					value: etfs[e].number,
					p: percents_c[etfs[e].country].toFixed(2),
				});
			}
	
	        var mapData = Highcharts.geojson(Highcharts.maps['custom/world']);
	
	        // Correct UK to GB in data
	        $.each(data_parsed, function () {
	            if (this.code === 'UK') {
	                this.code = 'GB';
	            }
	        });
	
	        $('#investment-maps').highcharts('Map', {
	            title: {
	                text: null
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
	                name: 'Investment by countries',
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
	                events: {
	                	click: function(e) {
	                		var flag = "http://files.stevenskelton.ca/flag-icon/flag-icon/svg/country-4x3/" + e.point.country.toLowerCase() + ".svg";
	                		
	                		$('#modal1').find('h4').html("My investment in <br>" + e.point.name);
	                		$('#modal1').find('img').attr({
	                			'alt': e.point.name,
	                			'src': flag,
	            			});
	
	                		// Gets ETF by country
	                		$("#modal1").find("tbody").html("");
	                		
                			for (var c in etfs) {
                				if (etfs[c].country == e.point.country) {
                					var line = "<tr>"
	                							+ "<td class='waves-effect waves-light'>" + etfs[c].name + "</td>"
	                							+ "<td>" + etfs[c].sector + "</td>"
	                							+ "<td>" + percents[etfs[c].isin] + "%</td>" +
	                						   "</tr>";
	                				
	                				$("#modal1").find("tbody").append(line);
                				}
                			}
            				
                			$('#modal1').openModal();
	                	}
	                }
	            }]
	        });
			
	        
	        //
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
		                showInLegend: true
		            }
		        },
		        series: [{
		            name: "Sectors",
		            colorByPoint: true,
		            data: data_sector
		        }]
		    });
			
			//
			// Profits vs Investment
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
		            lineColor: 'rgba(255,255,255,.3)',
		        },
		        yAxis: {
		            title: {
		                text: null
		            },
	            	gridLineColor: 'rgba(255,255,255,.3)'
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
		            data: [3300, 5460, 4000, 1500, 1236, 3548, 6523, 1236, 6523, 9985, 15600, 12562]
		        }, {
		            name: 'Profits',
		            data: [6520, 5620, 6200,  980, 1236, 6584, 1236, 3650, 6548, 15630, 25000, 15600],
	                color: 'rgba(255, 255, 255, .5)'
		        }]
		    });
	    });
	});
});