/*
 * Author: Abdullah A Almsaeed
 * Date: 4 Jan 2014
 * Description:
 *      This is a demo file used only for the main dashboard (index.html)
 **/

$(function () {

  "use strict";

  //Make the dashboard widgets sortable Using jquery UI
  $(".connectedSortable").sortable({
    placeholder: "sort-highlight",
    connectWith: ".connectedSortable",
    handle: ".box-header, .nav-tabs",
    forcePlaceholderSize: true,
    zIndex: 999999
  });
  $(".connectedSortable .box-header, .connectedSortable .nav-tabs-custom").css("cursor", "move");
  
  // BEGIN COUNTER FOR SUMMARY BOX
  $(".counter-num").each(function() {
      var o = $(this);
	  var end = Number(o.html()),
      	  start = end > 1000 ? Math.floor(end - 500) : Math.floor(end / 4),
	  	  speed = start > 500 ? 1 : 50;
	  	  
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
