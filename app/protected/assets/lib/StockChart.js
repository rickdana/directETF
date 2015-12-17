function LoadStockChart(series, container, clear, cb, options) {
    if (series instanceof Array) {
        for (var i = 0; i < series.length; i++) {
            LoadStockChart(series[i], container, clear, cb);
            clear = false;
        }
        return;
    }

    if (typeof container == 'string') {
        throw new Error("Second argument must be an Angular.js's element or an JQuery's element!");
    }

    var chart = container.highcharts();

    if (typeof chart == 'undefined') {
        var default_options = {
            //colors: ['rgba(0, 166, 90,.3)', 'rgba(255, 166, 90,.8)', 'rgba(0, 15, 255,.7)', 'rgba(0, 5, 30,.5)'],

            chart: {
                events: {
                    addSeries: function () {
                        if (typeof cb == 'function') {
                            cb(this);
                        }
                    }
                }
            },

            yAxis: [{ // Primary yAxis
                labels: {
                    //style: {
                    //    color: 'rgb(243, 156, 18)',
                    //    fontWeight: 'bold',
                    //    fontSize: '11px'
                    //},
                    useHTML: true,
                    format: '{value} &euro;',
                },
                opposite: false,
                gridLineColor: 'white',
                lineWidth: 0.5
            }],

            exporting: {
                enabled: false
            },

            tooltip: {
                useHTML: true,
                valueDecimals: 2,
                valueSuffix: ' &euro;'
            },

            mapNavigation: {
                enabled: false
            },

            legend: {
                enabled: true,
                //layout: 'vertical',
                y: 12,
                backgroundColor: 'transparent',
                itemStyle: {
                    color: 'rgb(69, 114, 167)',
                }
            },

            rangeSelector: {
                //enabled: false,
                buttons: [{
                    type: 'month',
                    count: 1,
                    text: '1m'
                }, {
                    type: 'month',
                    count: 3,
                    text: '3m'
                }, {
                    type: 'month',
                    count: 6,
                    text: '6m'
                }, {
                    type: 'ytd',
                    text: '2015'
                }, {
                    type: 'year',
                    count: 1,
                    text: '1an'
                }, {
                    type: 'all',
                    text: 'Tout'
                }],
                buttonTheme: {
                    fill: 'none',
                    stroke: 'none',
                    'stroke-width': 0,
                    r: 8,
                    style: {
                        color: 'rgb(69, 114, 167)',
                        fontWeight: 'bold'
                    },
                    states: {
                        hover: {},
                        select: {
                            fill: 'rgb(69, 114, 167)',
                            style: {
                                color: 'white'
                            }
                        }
                    }
                },
                inputEnabled: false,
                inputBoxBorderColor: 'rgb(216, 216, 216)',
                /*							inputBoxWidth: 120,
                 inputBoxHeight: 18,*/
                inputStyle: {
                    color: 'rgb(69, 114, 167)',
                    fontWeight: 'bold',
                    backgroundColor: '#39cccc'
                },
                /*labelStyle: {
                 color: 'silver',
                 fontWeight: 'bold'
                 },*/
                selected: 5
            },

            colorAxis: null,

            plotOptions: {
                areaspline: {
                    fillOpacity: 0
                },
                series: {
                    borderColor: 'transparent',
                    borderRadius: '3px',
                }
            },

            navigator: {
                enabled: false,
                outlineWidth: 2,
                height: 35,
                margin: 25,
                maskFill: 'rgba(19, 159, 159, .5)',
            },

            scrollbar: {
                enabled: false,
            },

            series: []
        };

        console.log(container)
        if (options) {
            for (var o in options) {
                default_options[o] = options[o];
            }
        }

        container.highcharts('StockChart', default_options);

        chart = container.highcharts();
        chart.rangeSelector.zoomText.hide();
        $.each(chart.rangeSelector.buttons,function(i,b){
            b.hide();
        });
    }

    clear = clear || false;

    if (clear) {
        while(chart.series.length > 0) {
            chart.series[0].remove( false );
        }
        chart.redraw();
    }

    if (series !== null) {
        chart.addSeries(series, true, true);
    }
}
