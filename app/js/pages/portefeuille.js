//B�n�fices vs Investissement
$('#profits-investment').highcharts({
    chart: {
        zoomType: 'xy'
    },
    title: {
		floating: !true,
		useHTML: true,
		text: 'Evolution du portefeuille',
		style: {
			color: 'rgb(255,255,255)',
		 },
    },
    exporting: {
    	enabled: false
    },
    chart: {
		backgroundColor:  "transparent",
		style: {
				border:  "none"
		}
    },

	credits: {
		style: {
			color: 'transparent'
		}
	},
    xAxis: {
            categories: ['Jan.13', 'Feb.13','Mar.13','Apr.13','May.13', 'Jun.13','Jul.13','Aug.13','Sept.13','Oct.13',
                     'Nov.13','Dec.13','Jan.14','Feb.14','Mar.14','Apr.14','May.14','Jun.14','Jul.14','Aug.14',
                     'Sept.14.','Oct.14','Nov.14','Dec.14','Jan.15','Feb.15','Mar.15','Apr.15','May.15','Jun.15',
                     'Jul.15','Aug.15','Sept.15'],
             crosshair: true,
             labels: {
                          step: 3,
                     },
             lineColor: 'rgba(255,255,255,.3)',
            },
    yAxis: [{
        title: null,
        gridLineColor: 'rgba(255,255,255,.3)'
    }],
    tooltip: {
        shared: true,
        valuePrefix: '$'
    },
	legend: {
		layout: 'vertical',
		align: 'left',
		verticalAlign: 'top',
		x: 50,
		y: 1,
		floating: true,
		backgroundColor: 'transparent'
	},
    plotOptions: {
        areaspline: {
            fillOpacity: 0
        },
		series: {
					animation: {
						duration: 2000
					},
					borderColor: 'transparent',
					borderRadius: '3px'
				}
    },
    series: [{
        name: 'Investissement',
        data: [3300, 5460, 4000, 1500, 1236, 3548, 6523, 1236, 6523, 9985, 15600, 12562,
               7500, 9045, 15697, 12051, 9571, 7541, 8167, 11610, 12541, 6897, 7861, 13640,
               11600, 8008, 9743, 3058, 1214, 5410, 8087, 6243, 6493],
        type: 'column',
        color: 'rgba(255, 255, 255, .8)'
    }, {
        name: 'Profit',
		type: 'spline',
        data: [6520, 5620, 6200,  980, 1236, 6584, 1236, 3650, 6548, 15630, 25000, 15600,
               6579, 12004, 16141, 19513, 16483, 10843, 7034, 3541, 12459, 13641, 13241, 8014,
               10843, 13006, 2015, 6214, 6482, 8191, 10641, 9982, 7611],
        color: 'rgb(243, 156, 18)',
    }]
});

//Mise en page
var x = ($('#profits-investment').height() - ($('#portefeuille').height() - ($("#portefeuille-valeur").outerHeight(true) - $("#portefeuille-valeur").innerHeight()) * 2)) / 2;
$('#portefeuille > div').each(function() {
  $(this).css('height', ($(this).outerHeight() + x) + 'px');
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
	                floating: !true,
	            	useHTML: true,
	            	text: "R&eacute;partition dans le monde",
	            	style: {
	                    color: 'rgb(255,255,255)',
	                 },
	            },
	            exporting: {
	            	enabled: false
	            },

                chart: {
                        backgroundColor:  "transparent",
                        style: {
                                border:  "none"
                        }
                },

                credits: {
                	style: {
                		color: 'transparent'
                	}
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
	            	formatter:  function  () {
						if  (this.point.value) {
							return this.point.name +  ' : '  +  this.point.value +  ' units';
						}
                    }
	            },

	            series : [{
	                name: 'ETFs by countries',
	                mapData: mapData,
	                color: '#E0E0E0',
	                enableMouseTracking: false
	            }, {
	                //type: 'mapbubble',
	                mapData: mapData,
	                nullColor:  'rgba(255,255,255, 0.99)',
                    borderColor:  'rgba(255,255,255,.3)',
                    color:  'rgba(243, 156, 18, .8)',
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
/*			if the number of ETFs is more than 50, it allows to page
			$('#investment-list').DataTable({
				"paging" : list.find('tr').length > 50,
				"lengthChange" : false,
				"pageLength" : 50,
				"searching" : false,
				"ordering" : !true,
				"info" : !true,
				"autoWidth" : false,
				"columnDefs" : [  {"type" : "alt-string", "targets" : 0} ],
			});*/
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
			data_sector.sort(function(a,b){return b.y-a.y});

			for (var i = 3; i < data_sector.length; i++) {
				data_sector[i].visible = false;
			}

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

			     title: {
                		floating: !true,
                		useHTML: true,
                		text: 'R&eacute;partition par secteurs',
                		style: {
                			color: 'rgb(255,255,255)',
                		 },
                    },

				exporting: {
					enabled: false
				},

				credits: {
					style: {
						color: 'transparent'
					}
				},
				chart: {
		            plotBackgroundColor: null,
		            plotBorderWidth: null,
		            plotShadow: false,
		            type: 'pie',
		            backgroundColor:  "transparent",
					style: {
							border:  "none",
					},
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
		                    enabled: false,
		                },
		                showInLegend: true,
		                borderColor: "transparent"
		            }
		        },

		        series: [{
		            name: "Sectors",
		            colorByPoint: true,
		            data: data_sector,
		        }],

				legend: {
					labelFormat: '{name} ({percentage:.1f}%)',
				},
		    });
		});		
	});

	// BEGIN COUNTER FOR SUMMARY BOX
      $(".counter-num").each(function() {
          var o = $(this);
    	  var end = Number(o.html()),
          	  start = end > 1000 ? Math.floor(end - 500) : Math.floor(end / 2),
    	  	  speed = start > 500 ? 1 : 10;

    	  $(o).html(start);

          setInterval(function(){
              var val = Number($(o).html());
              if (val < end) {
                  $(o).html(val+1);
              } else {
                  clearInterval();
              }
          }, speed);
      });
      //END COUNTER FOR SUMMARY BOX

});

//different display of etfs ( euro, percent, quanlity)
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


