Highcharts.theme = {

   colors: [
    'rgb(98,87,255)',
    'rgb(95,197,206)',
    'rgb(64,181,137)',
    'rgb(232,172,43)',
    'rgb(186,74,189)',
    'rgb(255,87,87)',
    'rgb(87,140,255)',
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

//   colorAxis: {
//       min: 1,
//       max: 1000,
//       type: 'logarithmic',
//       minColor: 'rgba(243, 156, 18, .1)',
//       maxColor: 'rgba(243, 156, 18, 1)',
//   }
};

// Apply the theme
Highcharts.setOptions(Highcharts.theme);