/* eslint no-param-reassign: ["error", { "props": false }] */
/* eslint-disable no-sparse-arrays */
/* eslint max-len: ["error", 100] */
/* global crossfilter dc d3 jQuery document window $ */


(function () {
  class WindSpeedHistogram {
    constructor(element) {
      this.cf = crossfilter();
      const binWidth = 1.0;

      this.AvgWindSpeed_Dim = this.cf.dimension(d =>
        // console.log("AvgWindSpeed_Dim");
        // console.log(parseFloat(d[Object.keys(d)[0]]["average wind speed"]));
        parseFloat(d[Object.keys(d)[0]]['average wind speed']),
      );
      this.AvgWindSpeed_Group = this.AvgWindSpeed_Dim.group(d =>
        // console.log("AvgWindSpeed_Group");
        // console.log(d);
        // console.log(Math.floor((d + 0.5) / binWidth) * binWidth);
        Math.floor((d + 0.5) / binWidth) * binWidth,
      );

      this.Gustiness_Dim = this.cf.dimension(d =>
        // console.log("Gustiness_Dim");
        // console.log(d[Object.keys(d)[0]]["maximum wind speed"] -
        // d[Object.keys(d)[0]]["average wind speed"]);

        (d[Object.keys(d)[0]]['maximum wind speed'] - d[Object.keys(d)[0]]['average wind speed']),
      );

      const outerWidth = $(element).outerWidth();

      this.chart = dc.barChart(element);

      this.chart.width(outerWidth)
        .transitionDuration(250)
        .height(400)
        .round(Math.floor)
        .centerBar(true)
        // .elasticX(true)
        .elasticY(true)
        .brushOn(false)
        // .xUnits(dc.units.fp.precision(binWidth))

        // .ticks(4)
        // .yAxis().ticks(3)
        .dimension(this.AvgWindSpeed_Dim)
        .group(this.AvgWindSpeed_Group)
        .margins({ top: 10, right: 20, bottom: 50, left: 40 })
        .xAxisLabel('average wind speed (m/s)')
        .yAxisLabel('# of intervals');

      this.updateXAxis();


      dc.renderAll();

      $(window).on('resize', () => {
        /*     clearTimeout(resizeId);
         resizeId = setTimeout(func(param), 1); */
        WindSpeedHistogram.resize(this);
      });

      $(document).on('click', '.sidebar-control', () => {
        WindSpeedHistogram.resize(this);
      });
    }

    updateXAxis() {
      const xExtent = d3.extent(this.AvgWindSpeed_Dim.top(Infinity), d =>
        // console.log("AvgWindSpeed_Dim in updateXAxis");
        // console.log(parseFloat(d[Object.keys(d)[0]]["average wind speed"]));
        parseFloat(d[Object.keys(d)[0]]['average wind speed']),
      );
      const xMax = Math.floor(xExtent[1] + 0.5) + 0.5;

      if ((this.chart.x() === undefined) || this.chart.x().domain()[1] !== xMax) {
        this.chart.x(d3.scale.linear().domain([0, xMax]).range([0, 488]));
        // this.chart.xAxis().ticks((xMax * 2));
        this.chart.xAxis().ticks((xMax));
        this.chart.rescale();

        dc.renderAll();
      }
    }

    updateYAxis() {
      const yExtent = d3.extent(this.AvgWindSpeed_Group.top(Infinity), d =>
        // console.log("yExtent");
        d.value,
      );

      if (yExtent[1] < 6) {
        this.chart.yAxis().ticks(yExtent[1]);
      } else {
        this.chart.yAxis().ticks(6);
      }
      // console.log("!!!!!!!!!!!!!!!!!!!!!!: " + yExtent[1]);
    }

    updatePlot() {
      this.precip_total = this.cf.groupAll().reduceSum(d => d.precipitation).value();
      this.num_intervals = this.AvgWindSpeed_Dim.top(Infinity).length;

      this.max_2_filter = this.Gustiness_Dim.filter([, 2]);
      // TODO count filtered values inside custom function


      this.updateYAxis();
      this.updateXAxis();

      dc.redrawAll();
    }

    addInterval(int) {
      const isDuplicateInterval = (interval) => {
        this.Gustiness_Dim.filterAll();
        this.AvgWindSpeed_Dim.filterAll();

        if (this.AvgWindSpeed_Dim === undefined) {
          return false;
        }

        // print_filter("AvgWindSpeed_Dim");
        // console.log("!!! :" + interval.timeStamp.val)

        const crossFilterIVS = this.AvgWindSpeed_Dim.top(Infinity);

        let index;
        for (index = 0; index < crossFilterIVS.length; index += 1) {
          // console.log("latest: " + interval.timeStamp.val
          // " db: " + intervals[index].timeStamp.val);
          if (Object.keys(interval)[0] === Object.keys(crossFilterIVS[index])[0]) {
            return true;
          }
        }
        return false;
      };

      const interval = jQuery.extend(true, {}, int);

      /*    console.log("interval: ");
       console.log(interval);
       console.log("intkey: " + Object.keys(interval)[0]); */

      if (this.AvgWindSpeed_Dim === undefined) {
        console.log('Uninitialized Histogram');
        return;
      }

      // assert: chart is initialized


      if ((!isDuplicateInterval(interval))
        && (typeof interval !== 'undefined')
        && (Object.keys(interval)[0] !== '')) {
        this.cf.add([interval]);
      }
    }
    static resize(param) {
      const parentNode = param.chart.root().node().parentNode;

      param.chart
        .width(parentNode.getBoundingClientRect().width - 20)
        .height(parentNode.getBoundingClientRect().height - 20)
        .transitionDuration(0)
        .rescale();
      param.chart.render();

      param.chart.transitionDuration(250);

      // param.updatePlot();
    }
  }


  window.WindSpeedHistogram = WindSpeedHistogram; // necessary for importing code to access class :(
}());
