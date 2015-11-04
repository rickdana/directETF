Highcharts.theme = {

   colors: ['#2599D4', '#3F24D5', '#9524D4', '#2663D6', '#D22581', '#FE7419', '#1BD52A', '#D56D6F',
            '#CE0C74', '#F0D317'
   ],

   title: {
       text: null
   },

   exporting: {
    enabled: false
   },
    legend: {
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