function load_etf_chart_prices(series, container, done, clear) {
    if (series.length == 0) {
        throw new Error("First argument must be an array of object's series");
    }
    if (typeof series.isin == 'undefined') {
        throw new Error("A serie object must contain the property 'isin'!\n" + JSON.stringify(series), undefined, 4);
    }

    if (typeof container == 'string') {
        container = $(container);
    }

    if (container.attr('data-chart-etf-loaded') !== '1') {
        container.highcharts('StockChart', {
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
                //layout: 'vertical',
                y: 12,
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
        container.attr('data-chart-etf-loaded', '1');
    }

    clear = clear || false;

    if (clear) {
        var chart = container.highcharts();

        while(chart.series.length > 0) {
            chart.series[0].remove( false );
        }
        chart.redraw();
    }

    $.getJSON(WS_URL + '/etf/prices/' + series.isin, function (prices) {
        var data_parsed = [];

        for (var i = 0; i < prices.length; i++) {
            var entry = prices[i];

            for (var entry in prices[i]) {
                data_parsed.push([new Date(entry).getTime(), prices[i][entry]]);
            }
        }

        data_parsed.sort(function (a, b) {
            return a[0] - b[0];
        });

        if (typeof done == 'function') {
            var ouput = done(data_parsed, container.highcharts());
            data_parsed = ouput || data_parsed;
        }

        series.data = data_parsed;

        container.highcharts().addSeries(series, true, true);
    });
}