var html_box_raw = '\
    <div id="etf-info-box-wrapper" title="Cliquez pour fermer">\
        <div id="etf-info-box" class="info-box" title="">\
            <div class="info-box-icon bg-green">\
                <i class="fa fa-area-chart"></i>\
            </div>\
            <div class="info-box-content">\
                <h3 class="info-box-text">Sales</h3>\
                <div class="etf-info-details text-center">\
                    Diversification sectorielle\
                    <div id="etf-info-sectors"></div>\
                </div>\
                <div class="infos">\
                    <span class="isin" data-label="ISIN">FR0010408799</span>\
                    <span class="cloture" data-label="Derniere cloture">27,90 EUR</span>\
                    <span class="dividente" data-label="Dividendes">4,3 %</span>\
                </div>\
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
$('<link>')
  .appendTo('head')
  .attr({type : 'text/css', rel : 'stylesheet'})
  .attr('href', '/css/helpers/etf-info-box.css');


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
    etf_info_box_wrapper.find('.isin').text($(a).attr('data-code'));

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
//            height:200,
            width:200,
            style: {
                top: '-100px',
//                    left: '-30px'
                'margin-bottom': '-150px'
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
                }
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
            height:160
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