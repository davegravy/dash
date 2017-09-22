/* eslint-disable no-sparse-arrays */
/* eslint max-len: ["error", 100] */
/* global d3 window $ document */

(function () {
  // Chart setup
//    var ProgressCounter = class ProgressCounter {

  class ProgressCounter {
    constructor(element, radius, border, color, end, iconClass, textTitle, textAverage) {
      // Basic setup
      // ------------------------------

      // Main variables
      this.element = element;
      this.currAngle = 0;
      this.d3Container = d3.select(this.element);
      this.endPercent = end;
      this.formatPercent = d3.format('.0%');
      const boxSize = radius * 2;
      const iconSize = 32;


      // Create chart
      // ------------------------------

      // Add SVG element
      const container = this.d3Container.append('svg');

      // Add SVG group
      this.svg = container
        .attr('width', boxSize)
        .attr('height', boxSize)
        .append('g')
        .attr('transform', `translate(${boxSize / 2},${boxSize / 2})`);


      // Construct chart layout
      // ------------------------------

      // Arc
      this.arc = d3.svg.arc()
        .startAngle(0)
        .innerRadius(radius)
        .outerRadius(radius - border);


      //
      // Append chart elements
      //

      // Paths
      // ------------------------------

      // Background path
      this.svg.append('path')
        .attr('class', 'd3-progress-background')
        .attr('d', this.arc.endAngle(Math.PI * 2))
        .style('fill', '#eee');

      // Foreground path
      this.foreground = this.svg.append('path')
        .attr('class', 'd3-progress-foreground')
        .attr('filter', 'url(#blur)')
        .style('fill', color)
        .style('stroke', color);

      // Front path
      this.front = this.svg.append('path')
        .attr('class', 'd3-progress-front')
        .style('fill', color)
        .style('fill-opacity', 1);


      // Text
      // ------------------------------

      // Percentage text value
      this.numberText = d3.select(this.element)
        .append('h2')
        .attr('class', 'mt-15 mb-5');

      // Icon
      this.iconClass = d3.select(this.element)
        .append('i')
        .attr('class', `${iconClass} counter-icon`)
        .attr('style', `top: ${(boxSize - iconSize) / 2}px`);

      // Title
      d3.select(this.element)
        .append('div')
        .text(textTitle);

      // Subtitle
      this.subtext = d3.select(this.element)
        .append('div')
        .attr('class', 'text-size-small text-muted')
        .text(textAverage);
    }
    // Animation
    // ------------------------------

    // Animate path
    updateProgress(prog) {
      let progress = prog;

      if (progress > 1) { progress = 1; }
      if (progress < 0) { progress = 0; }
      this.currAngle = Math.PI * 2 * progress; // this will be the new angle

      this.foreground.attr('d', this.arc.endAngle(this.currAngle)); // make it so
      this.front.attr('d', this.arc.endAngle(this.currAngle)); // make it so
      this.numberText.text(this.formatPercent(progress));
    }
    setColor(color) {
      this.foreground
        .style('fill', color)
        .style('stroke', color);

      // Front path
      this.front
        .attr('class', 'd3-progress-front')
        .style('fill', color)
        .style('fill-opacity', 1);
    }

    setIconClass(iconClass) {
      this.iconClass
        .attr('class', `${iconClass} counter-icon`);
    }

    setSubText(subtext) {
      this.subtext.text(subtext);
    }

    animateUpdateProgress(progress, time) {
      // Animate text


      let noOfSteps = time / 10;
      const endAngle = Math.PI * 2 * progress;
      let distance = Math.abs(this.currAngle - endAngle);
      let step = endAngle < this.currAngle ? -(distance / noOfSteps) : (distance / noOfSteps);
      /*                console.log("currPos: " + this.currAngle);
       console.log("endAngle: " + endAngle);
       console.log("step: " + step);
       console.log("distance1: " + distance); */

      // this.updateProgress(0.28);
      const loops = () => {
        /* https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Functions/Arrow_functions
         function needed to preserve context from outer function
         console.log("distance2: "+ distance);
         console.log("currAngle: " + this.currAngle); */

        if (distance > 0) {
          this.updateProgress((this.currAngle + step) / (Math.PI * 2));
          noOfSteps -= 1;
          distance = Math.abs(this.currAngle - endAngle);
          step = endAngle < this.currAngle ? -(distance / noOfSteps) : (distance / noOfSteps);
          distance -= Math.abs(step);

          // this.updateProgress(0.28);

          setTimeout(loops, 10);
        }
      };
      loops();
    }
  }

  class TimeSeriesChart {
    // Chart setup
    constructor(element, height, arrColors, timeWindow, yAxisLabel) { // timewindow in seconds
      // const date = new Date();

      this.data = [];

      // Basic setup
      // ------------------------------

      // Define main variables
      this.d3Container = d3.select(element);
      this.margin = { top: 5, right: 30, bottom: 30, left: 100 };
      this.width = this.d3Container.node().getBoundingClientRect().width
        - this.margin.left - this.margin.right;
      this.height = height - this.margin.top - this.margin.bottom;

      this.yAxisLabel = yAxisLabel;
      this.timeWindow = timeWindow;
      this.arrColors = arrColors;

      // Line colors
      // green-800,orange-800,blue-800
      this.color = d3.scale.ordinal().range(arrColors);

      // Create chart
      // ------------------------------

      // Container
      this.container = this.d3Container.append('svg');

      // SVG element
      this.svg = this.container
        .attr('width', this.width + this.margin.left + this.margin.right)
        .attr('height', height + this.margin.top + this.margin.bottom)
        .append('g')
        .attr('transform', `translate(${this.margin.left},${this.margin.top
        })`);


      // Resize function
      //
      // Since D3 doesn't support SVG resize by default,
      // we need to manually specify parts of the graph that need to
      // be updated on window resize

      $(window).on('resize', () => {
        /*     clearTimeout(resizeId);
         resizeId = setTimeout(func(param), 1); */
        TimeSeriesChart.timeSeriesChartResize(this);
      });

      $(document).on('click', '.sidebar-control', () => {
        TimeSeriesChart.timeSeriesChartResize(this);
      });
      /* registerEvents(this, TimeSeriesChart.timeSeriesChartResize); */


      // Draw the line
      this.line = d3.svg.line()
        .x(d => this.x(d.date))
        .y(d => this.y(d.value))
        .interpolate('cardinal');

      const timeFormatter = d3.time.format('%S');


      this.xAxis = d3.svg.axis()
        .orient('bottom')
        .tickPadding(8)
        .ticks(d3.time.second)
        .innerTickSize(4)
        .tickFormat(d => `${timeFormatter(d)}s`);

      this.yAxis = d3.svg.axis()
        .orient('left')
        .ticks(6)
        .tickSize(0 - this.width)
        .tickPadding(8);


      // Append axes
      // ------------------------------

      this.svg.append('text')
        .attr('text-anchor', 'middle')
        // this makes it easy to centre the text as the transform is applied to the anchor
        .attr('transform', `translate(${-65},${(this.height / 2) + 20})rotate(-90)`)
        // text is drawn off the screen top left, move down and out and rotate
        .text(this.yAxisLabel);

      // Vertical
      this.svg.append('g')
      // now add title to the y axis
        .attr('class', 'd3-axis d3-axis-vertical d3-axis-transparent');
      // Horizontal
      this.svg.append('g')
        .attr('class', 'd3-axis d3-axis-horizontal d3-axis-solid')
        .attr('transform', `translate(0,${this.height})`);


      this.x = d3.time.scale();
      this.y = d3.scale.linear();
    }
    // Set terms of transition on date change
    /*    change() {
     /!* d3.transition()
     .duration(250)
     .each(this.redraw); *!/
     } */


    // Main chart drawing function
    // ------------------------------

    redraw() {
      // Construct chart layout
      // ------------------------------

      // Create data nests
      /*                var nested = d3.nest()
       .key(function(d) { return d.type; })
       .map(formatted) */

      // Get value from menu selection
      // the option values correspond
      // to the [type] value we used to nest the data
      // var series = menu.val();

      /*              var series = "val3";

       console.log(typeof series + ": " + typeof nested); */
      // Only retrieve data from the selected series using nest

      // For object constancy we will need to set "keys",
      // one for each type of data (column name) exclude all others.
      if (this.colorKeys === undefined) {
        this.colorKeys = d3.keys(this.data[0]).filter(key => (key !== 'date'));
        this.color.domain(this.colorKeys);
      }


      // Setting up color map
      let linedata = this.color.domain().map(name =>
        // console.log("name1: " + name);
        ({
          name,
          values: this.data.map(d => // iterates through data array
            /* console.log(JSON.stringify(d));
               console.log(d.date); */
            ({ name, date: d.date, value: d[name] }),
            // return {name: name, date: d.date, value: parseFloat(d[name], 10)};
          ),
        }),
      );


      // Construct scales
      // ------------------------------

      // Horizontal
      this.x = d3.time.scale()
        .domain([
          d3.min(linedata, c => d3.min(c.values, v => v.date)),
          d3.max(linedata, c => d3.max(c.values, v => v.date)),
        ])
        .range([0, this.width]);

      // Vertical
      this.y = d3.scale.linear()
        .domain([
          d3.min(linedata, c => d3.min(c.values, v => v.value)),
          d3.max(linedata, c => d3.max(c.values, v => v.value)),
        ])
        .range([this.height, 0]);

      // Create axes
      // ------------------------------


      this.xAxis.scale(this.x);

      this.yAxis.scale(this.y);


      //
      // Append chart elements
      //

      // Append lines
      // ------------------------------
      // Bind the data
      let lines = this.svg
        .selectAll('.lines')
        .data(linedata);

      // Append a group tag for each line
      let lineGroup = lines
        .enter()
        .append('g')
        .attr('class', 'lines')
        .attr('id', d => `${d.name}-line`);

      // Append the line to the graph
      lineGroup.append('path')
        .attr('class', 'd3-line d3-line-medium')
        .style('stroke', d => this.color(d.name))
        .style('opacity', 1)
        .attr('d', d => this.line(d.values[0]));
      // .transition()
      /* .duration(500)
       //TODO: optimize?
       .delay(function(d, i) {return i * 200; })
       .style('opacity', 1); */

      // Append circles
      // ------------------------------

      /*            lines
       //uncomment for circles

       .selectAll("circle")
       .data(function(d) {return d.values; })
       .enter()
       .append("circle")
       .attr("class", "d3-line-circle d3-line-circle-medium")
       .attr("cx", (d,i) => {return this.x(d.date)})
       .attr("cy", (d,i) => {return this.y(d.value)})
       .attr("r", 3)
       .style('fill', '#fff')
       .style('opacity', 1)
       .style("stroke", (d) => { return this.color(d.name); }); */


      // Add transition
      /*            circles
       .style('opacity', 1)
       .transition()
       .duration(500)
       .delay(500)
       .style('opacity', 1); */

      // Update chart on date change
      // ------------------------------

      // Set variable for updating visualization
      let lineUpdate = d3.transition(lines);
      // Update lines
      lineUpdate.select('path').attr('d', d => this.line(d.values));
      // Update circles
      lineUpdate.selectAll('circle')
        .attr('cy', d => this.y(d.value))
        .attr('cx', d => this.x(d.date)); // Update vertical axes
      d3.transition(this.svg)
        .select('.d3-axis-vertical')
        .call(this.yAxis);


      // Update horizontal axes
      d3.transition(this.svg)
        .select('.d3-axis-horizontal')
        .attr('transform', `translate(0,${this.height})`)
        .call(this.xAxis);


      linedata = null;
      lines = null;
      lineGroup = null;
      lineUpdate = null;
    }

    static timeSeriesChartResize(param) {
      // Layout
      /*               console.log("type1: " + typeof parameter);

       // -------------------------
       console.log(typeof parameter.d3Container);

       console.log("margin" + parameter.margin.left); */

      const parameter = param;

      console.log('BB width: ' + parameter.d3Container.node().getBoundingClientRect().width);
      console.log(parameter.margin.left + parameter.margin.right);
      // Define width
      parameter.width = parameter.d3Container.node().getBoundingClientRect().width
        - parameter.margin.left - parameter.margin.right; // should be this.?

      // Main svg width
      parameter.container
        .attr('width', parameter.width + parameter.margin.left + parameter.margin.right);

      // Width of appended group
      parameter.svg
        .attr('width', parameter.width + parameter.margin.left + parameter.margin.right);

      // Horizontal range
      parameter.x.range([0, parameter.width]);

      // Vertical range
      parameter.y.range([parameter.height, 0]);


      // Chart elements
      // -------------------------

      // Horizontal axis
      parameter.svg.select('.d3-axis-horizontal').call(parameter.xAxis);

      // Vertical axis
      parameter.svg.select('.d3-axis-vertical').call(parameter.yAxis.tickSize(0 - parameter.width));

      // Lines
      parameter.svg.selectAll('.d3-line').attr('d', d => parameter.line(d.values));

      // Circles
      parameter.svg.selectAll('.d3-line-circle').attr('cx', d => parameter.x(d.date));
    }

    static getLatestDate(arr) {
      let latestDate;
      let currentDate;

      for (let i = 0; i < arr.length; i += 1) {
        currentDate = Date.parse(arr[i].date);
        // console.log("currentDate: " + currentDate);
        // console.log(arr[i].date);
        if (latestDate === undefined || latestDate < currentDate) {
          latestDate = currentDate;
        }
      }
      currentDate = null;
      return latestDate;
    }


    static stripOldData(arr, timeWindow) {
      const latestDate = TimeSeriesChart.getLatestDate(arr);
      // console.log("latestDate: "+ latestDate);
      // console.log(JSON.stringify(arr));
      for (let i = arr.length - 1; i >= 0; i -= 1) {
        if (latestDate - Date.parse(arr[i].date) > timeWindow * 1000) {
          // console.log("splice");
          arr.splice(i, 1);
        }
      }
    }

    isDateDuplicate(date) {
      for (let i = 0; i < this.data.length; i += 1) {
        if (this.data[i].date.getTime() === date.getTime()) { return true; }
        if (Math.abs(date.getTime() - this.data[i].date.getTime()) < 500) {
          console.log(`time difference: 
          ${date.getTime() - this.data[i].date.getTime()}`);
        }
        if (date.getTime() - this.data[i].date.getTime < 0) {
          console.log(`out of order. time difference: 
          ${date.getTime() - this.data[i].date.getTime()}`);
        }
      }
      return false;
    }

    pushData(data) {
      if (!(('date') in data)) {
        throw new Error('No date key found');
      }
      if (this.isDateDuplicate(data.date) === true) {
        return;
      }

      // console.log(JSON.stringify(data));
      if (Object.keys(data).length - 1 !== this.arrColors.length) {
        throw new Error(`Array size mismatch: 
        ${Object.keys(data).length}vs ${this.arrColors.length}`);
      }

      this.data.push(data);
      // console.log(JSON.stringify(this.data));


      TimeSeriesChart.stripOldData(this.data, this.timeWindow);

      // if (this.data.length > 7) {this.data.shift()}
      this.redraw();
    }
  }


  window.ProgressCounter = ProgressCounter; // necessary for importing code to access class :(
  window.TimeSeriesChart = TimeSeriesChart; // necessary for importing code to access class :(
}());
