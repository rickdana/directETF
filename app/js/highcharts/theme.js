Highcharts.theme = {

   colors: ['rgba(64,19,117,0.05)', 'rgba(64,19,117,0.2)', 'rgba(64,19,117,0.4)',
                       'rgba(64,19,117,0.5)', 'rgba(64,19,117,0.6)', 'rgba(64,19,117,0.8)', 'rgba(64,19,117,1)'],

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

   mapNavigation: {
       enabled: true,
       buttonOptions: {
           verticalAlign: 'bottom'
       }
   },

   tooltip: {
    useHTML: true,
    //pointFormat: '{point.name}: {point.p} units',
       formatter: function () {
           if (this.point.value) {
               return this.point.name + ' : ' + this.point.value + ' units';
           }
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