var html_box_raw = '\
    <div id="etf-info-box-wrapper" title="Cliquez pour fermer">\
        <div id="etf-info-box" class="info-box" title="">\
            <div class="info-box-icon bg-green">\
                <i class="fa fa-area-chart"></i>\
            </div>\
            <div class="info-box-content">\
                <h3 class="info-box-text">Sales</h3>\
                <table class="etf-info-details">\
                    <tbody>\
                        <tr class="code">\
                            <td>Code</td>\
                            <td class="value">DE000A0H08K7</td>\
                        </tr>\
                        <tr class="valeur">\
                            <td>Derniere cloture</td>\
                            <td class="value">27,90 EUR</td>\
                        </tr>\
                        <tr class="return">\
                            <td>Dividendes</td>\
                            <td class="value">\
                                4,3 %\
                            </td>\
                        </tr>\
                    </tbody>\
                    <tfoot>\
                        <tr>\
                            <td colspan="2" class="text-center">\
                                <br>\
                                Diversification sectorielle\
                                <div id="etf-info-sectors"></div>\
                            </td>\
                        </tr>\
                    </tfoot>\
                </table>\
                <div class="etf-info-description">\
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ac ipsum iaculis velit\
                    consequat porttitor sit amet non augue. Ut faucibus libero lacus.\
                    <a href="#">En savoir plus...</a>\
                    <br>\
                    <div class="map" title="Europe" data-src="http://www.ardex-pandomo.com/fileadmin/images/worldmap/ac-europe.png"></div>\
                    <div class="map" title="Asie" data-src="http://www.ardex-pandomo.com/fileadmin/images/worldmap/ac-asia.png"></div>\
                </div>\
                <h4>Performance historique du titre</h4>\
                <div id="etf-info-history"></div>\
                <button class="btn btn-flat bg-green pull-right">Fermer</button>\
                <br>\
            </div>\
        </div>\
    </div>';

$('section.content').append($(html_box_raw));

// Load helper's css
var tmp = location.pathname.split('/')
          , base = tmp.slice(0, tmp.length - 1).join('/');
$('<link>')
  .appendTo('head')
  .attr({type : 'text/css', rel : 'stylesheet'})
  .attr('href', base + '/css/helpers/etf-info-box.css');


var etf_info_box_wrapper = $("#etf-info-box-wrapper")
  , etf_info_box = etf_info_box_wrapper.find('.info-box');

etf_info_box.css("top", ($('.content-header').offset().top + $('.content-header').height() + 20) + "px");

etf_info_box_wrapper.css('display', 'block')
                    .hide()
                    .on('click', function() {
                        $(this).fadeOut('slow');
                        return false;
                    });
$('#etf-info-box').on('click', function() {
    return false;
}).find('.btn').click(function() {
    etf_info_box_wrapper.click();
})

etf_info_box.find('.map').each(function() {
    $(this).css('background-image', 'url(' + $(this).attr('data-src') + ')');
})

show_etf_info = function(a) {
    etf_info_box_wrapper.find('.info-box-text').text($(a).text());
    etf_info_box_wrapper.find('.code .value').text($(a).attr('data-code'));

    etf_info_box_wrapper.fadeIn('slow');

    etf_info_box.css("left", Math.max(0, (($(document).width() - etf_info_box.width()) / 2) +
                                                    $(document).scrollLeft() + $('.main-sidebar').width() / 2) + "px");

    $('#etf-info-sectors').html('').highcharts({
        //colors: ['rgba(0, 166, 90,.3)', 'rgba(0, 166, 90,.8)', 'rgba(0, 166, 90,.7)', 'rgba(0, 166, 90,.5)'],

        mapNavigation: {
           enabled: false
        },

        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: 0,
            plotShadow: false,
            height:200,
            style: {
                top: '-15px',
//                    left: '-30px'
                'margin-bottom': '-140px'
            }
        },
        tooltip: {
            useHTML: false,
            formatter: function () {
               return this.point.name + ' : ' + this.point.y + '%';
            }
        },
        plotOptions: {
            pie: {
                dataLabels: {
                    enabled: false,
                    distance: -50,
                },
                startAngle: -90,
                endAngle: 90,
            }
        },
        series: [{
            type: 'pie',
            data: [
                ['Finance',   10.38],
                ['Santé',       56.33],
                ['Industrie', 24.03],
                ['Energie',    4.77],
                ['Technologie',     0.91],
                {
                    y: 0.2,
                    dataLabels: {
                        enabled: false
                    }
                }
            ]
        }]
    });
};

$.getJSON('http://www.highcharts.com/samples/data/jsonp.php?filename=aapl-c.json&callback=?', function (data) {
    $('#etf-info-history').highcharts('StockChart', {
        mapNavigation: {
           enabled: false
        },

        chart: {
            height:200
        },

        rangeSelector : {
            enabled: false,
            selected : 5
        },

        series : [{
            data : data,
            tooltip: {
                valueDecimals: 2
            }
        }]
    });
});