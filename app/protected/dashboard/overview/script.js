$(function () {

  "use strict";

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
