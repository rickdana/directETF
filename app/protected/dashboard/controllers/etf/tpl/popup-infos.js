var etf_info_box_wrapper = $("#etf-info-box-wrapper")
  , etf_info_box = etf_info_box_wrapper.find('.info-box');

etf_info_box.css("top", ($('.content-header').height() + 20) + "px");
etf_info_box.css("left", ($('.content-header').width() / 2) + "px");

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
});

// TODO Set a highmaps here
etf_info_box.find('.map').each(function() {
    $(this).css('background-image', 'url(' + $(this).attr('data-src') + ')');
});


