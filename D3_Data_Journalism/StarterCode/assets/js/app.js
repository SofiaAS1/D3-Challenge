// Chart Params
var svgWidth = 960;
var svgHeight = 500;

var margin = { top: 50, right: 50, bottom: 50, left: 50 };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight); 

  var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  d3.csv("assets/data/data.csv").then(function(fullData) {
    console.log(fullData);

    fullData.forEach(function(data) {
        data.poverty = +data.poverty;
        data.healthcare = +data.healthcare;
    });

    var xLinearScale = d3.scaleLinear()
    .range([0, width])
    .domain(d3.max(fullData, data => data.poverty));

    var yLinearScale = d3.scaleLinear()
    .range([height, 0])
    .domain([0, d3.max(fullData, data => data.healthcare)]);

    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    chartGroup.selectAll("circle")
      .data(fulllData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d.poverty))
      .attr("cy", d => yLinearScale(d.healthcare))
      .attr("r", "10")
      .attr("fill", "blue")
      .attr("stroke-width", "1")
      .attr("stroke", "black");

      chartGroup.append("g")
      .classed("axis", true)
      .call(leftAxis);
  
      chartGroup.append("g")
      .classed("axis", true)
      .attr("transform", "translate(0, " + chartHeight + ")")
      .call(bottomAxis);
  })
  .catch(function(error) {
    console.log(error);
  });






// var mainDiv = d3.select('#scatter');
// var width = parseInt(mainDiv.style('width'));
// var height = width - width/3.9;
// var margin = 20;
// var pad = 40;
// var labelArea = 120;

// d3.csv('assets/data/data.csv').then(function (data) {
//     console.log(data);
// });

// var svg = d3    
//     .select('#scatter')
//     .append('svg')
//     .style('height',height)
//     .style('widht',width)
//     .style('background','lightgrey')
//     .attr('class','chart');

// svg.append('g').attr('class','xText');
// svg.append('g').attr('class','yText');

// var xText = d3.select('.xText');
// var yText = d3.select('.yText');

// xText
//     .append('text')
//     .attr('y', -26)
//     .attr('data-name','poverty')
//     .attr('data-axis','x')
//     .attr('class','aText active x')
//     .text('In Poverty (%)')
//     .attr('transform',`translate(${((width - labelArea)/2 + labelArea)}, ${(height-margin-pad)})`);

// yText
//     .append('text')
//     .attr('y', -26 )
//     .attr('data-name','heathcare')
//     .attr('data-axis', 'y')
//     .attr('class', 'aText active y')
//     .text('Lacks Healthcare(%)')
//     .attr('transform', `translate(${(margin + pad)}, ${(height + labelArea)/2 - labelArea})rotate(-90)`);


