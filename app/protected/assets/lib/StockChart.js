function LoadStockChart(series, container, done, clear, cb) {
    if (series instanceof Array) {
        for (var i = 0; i < series.length; i++) {
            LoadStockChart(series[i], container, done, clear, cb);
            clear = false;
        }
        return;
    }

    if (series.length == 0) {
        throw new Error("First argument must be an array of object's series");
    }
    if (typeof series.isin == 'undefined' && typeof series.data == 'undefined') {
        throw new Error("A serie object must contain the property 'isin'!\n" + JSON.stringify(series), undefined, 4);
    }

    if (typeof container == 'string') {
        container = $(container);
    }

    var chart = container.highcharts();

    if (typeof chart == 'undefined') {
        container.highcharts('StockChart', {
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
                        style: {
                            color: 'rgb(243, 156, 18)',
                            fontWeight: 'bold',
                            fontSize: '11px'
                        },
                        useHTML: true,
                        format: '{value} &euro;',
                    },
                    opposite: false,
                }, { // Secondary yAxis
                    labels: {
                        style: {
//                            color: 'rgba(0, 0, 0, .8)',
                            fontSize: '11px'
                        }
                    },
                }, { // Third yAxis
                labels: {
                    style: {
                        //color: 'rgba(255, 255, 255, .8)',
                        fontSize: '11px'
                    }
                },
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
                verticalAlign: 'top',
                y: -15,
                margin: 20,
                backgroundColor: 'transparent',
                itemStyle: {
                    color: 'rgb(69, 114, 167)',
                }
            },

            rangeSelector: {
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
                outlineWidth: 2,
                height: 35,
                margin: 25,
                maskFill: 'rgba(19, 159, 159, .5)',
            },

            scrollbar: {
                enabled: true,
            },

            series: []
        });
        chart = container.highcharts();
    }

    clear = clear || false;

    if (clear) {
        while(chart.series.length > 0) {
            chart.series[0].remove( false );
        }
        chart.redraw();
    }

    if (typeof series.data == 'object') {
        chart.addSeries(series, true, true);
        return;
    }

    $.getJSON(WS_URL + '/etf/prices/' + series.isin, function (prices) {
        var data_parsed = [];

        if (typeof done == 'function') {
            var ouput = done(prices, chart);
            data_parsed = ouput || data_parsed;
        } else {
            for (var i = 0; i < prices.length; i++) {
                var entry = prices[i];

                for (var entry in prices[i]) {
                    data_parsed.push([new Date(entry).getTime(), prices[i][entry]]);
                }
            }

            data_parsed.sort(function (a, b) {
                return a[0] - b[0];
            });
        }

        series.data = data_parsed;

        chart.addSeries(series, true, true);
    });
}
