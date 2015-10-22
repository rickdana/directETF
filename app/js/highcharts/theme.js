Highcharts.theme = {

   colors: ['rgb(128, 133, 233)', 'rgb(241, 92, 128))', 'rgb(228, 211, 84)',
                       'rgb(43, 144, 143)', 'rgb(244, 91, 91)', 'rgb(124, 181, 236)', 'rgb(67, 67, 72)',
                        'rgb(144, 237, 125)', ' rgb(247, 163, 92)'],

   title: {
       text: null
   },

   exporting: {
    enabled: false
   },

   chart: {
       backgroundColor: "transparent",
       style: {
           border: "none"
       }
   },

  credits: {
     style: {
        color: 'transparent'
     }
  },

   plotOptions: {
      series: {
         nullColor: 'rgba(255,255,255, 0.99)',
         borderColor: 'rgba(255,255,255,.3)',
         color: 'rgba(243, 156, 18, .8)',
      }
   },

   colorAxis: {
       min: 1,
       max: 1000,
       type: 'logarithmic',
       minColor: 'rgba(243, 156, 18, .1)',
       maxColor: 'rgba(243, 156, 18, 1)',
   }
};

// Apply the theme
Highcharts.setOptions(Highcharts.theme);