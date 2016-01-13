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
                },
                style: {
                    fontFamily: 'Josefin Sans'
                },
                backgroundColor:'rgba(255, 255, 255, 0.01)'
            },

            xAxis: {
                lineColor: 'rgb(0, 0, 0)'
            },

            yAxis: {
                opposite: false,
                gridLineColor: 'transparent',
                lineColor: 'rgb(0, 0, 0)',
                lineWidth: 0.5,
                labels: {
                    useHTML: true,
                    format: '{value} &euro;',
                },

            },

            exporting: {
                enabled: false
            },

            credits: {
                enabled: false
            },

            tooltip: {
                useHTML: true,
                valueDecimals: 2,
                pointFormat: '<span style="color:{point.color}">\u25CF</span> <b>{point.y} &euro;</b><br/>',
                //valueSuffix: ' &euro;',
                dateTimeLabelFormats: {
                    day: "%e %b %Y"
                },
            },

            mapNavigation: {
                enabled: false
            },

            legend: {
                enabled: true,
                align: 'left',
                verticalAlign: 'top',
                y: -11,
                x: 8,
                backgroundColor: 'transparent',
                itemStyle: {
                    fontSize:'14px',
                },
                symbolHeight: 12,
                symbolWidth: 12,
                symbolRadius: 6,
            },

            rangeSelector: {
                //enabled: false,
                inputEnabled: false,
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
                    threshold: null
                }
            },

            navigator: {
                enabled: false,
            },

            scrollbar: {
                enabled: false,
            },

            series: []
        };

        if (options) {
            for (var o in options) {
                default_options[o] = options[o];
            }
        }

        container.highcharts('StockChart', default_options);

        chart = container.highcharts();
        console.log(chart)
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
