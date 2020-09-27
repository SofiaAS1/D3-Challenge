var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 75,
  right: 75,
  bottom: 100,
  left: 100,
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(hairData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(hairData, d => d[chosenXAxis]) * 0.8,
      d3.max(hairData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "poverty") {
    label = "In Poverty (%)";
  }
  else {
    label = "Age (Median)";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]} <br> Obese (%) ${d.obesity}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(fullData, err) {
  if (err) throw err;

  // parse data
  fullData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.obesity = +data.obesity;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(fullData, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(fullData, d => d.obesity)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(fullData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.obesity))
    .attr("r", 20)
    .attr("fill", "blue")
    .attr("opacity", ".5");

  // Create group for two x-axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Obesity (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(fullData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});



// Tutor Work 

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

// First Attempt

// // Chart Params
// var svgWidth = 960;
// var svgHeight = 500;

// var margin = { 
//     top: 50, 
//     right: 50, 
//     bottom: 50, 
//     left: 50 
// };

// var width = svgWidth - margin.left - margin.right;
// var height = svgHeight - margin.top - margin.bottom;

// var svg = d3
//   .select("#scatter")
//   .append("svg")
//   .attr("width", svgWidth)
//   .attr("height", svgHeight); 

//   var chartGroup = svg.append("g")
//   .attr("transform", `translate(${margin.left}, ${margin.top})`);

//   var chosenXAxis = "hair_length";

//   function xScale(hairData, chosenXAxis) {
//     var xLinearScale = d3.scaleLinear()
//       .domain([d3.min(hairData, d => d[chosenXAxis]) * 0.8,
//         d3.max(hairData, d => d[chosenXAxis]) * 1.2
//       ])
//       .range([0, width]);
  
//     return xLinearScale;
//   }

//   function renderAxes(newXScale, xAxis) {
//     var bottomAxis = d3.axisBottom(newXScale);
  
//     xAxis.transition()
//       .duration(1000)
//       .call(bottomAxis);
  
//     return xAxis;
//   }

//   function renderCircles(circlesGroup, newXScale, chosenXAxis) {

//     circlesGroup.transition()
//       .duration(1000)
//       .attr("cx", d => newXScale(d[chosenXAxis]));
  
//     return circlesGroup;
//   }

//   function updateToolTip(chosenXAxis, circlesGroup) {

//     var label;
  
//     if (chosenXAxis === "hair_length") {
//       label = "Hair Length:";
//     }
//     else {
//       label = "# of Albums:";
//     }
  
//     var toolTip = d3.tip()
//       .attr("class", "tooltip")
//       .offset([80, -60])
//       .html(function(d) {
//         return (`${d.rockband}<br>${label} ${d[chosenXAxis]}`);
//       });
  
//     circlesGroup.call(toolTip);
  
//     circlesGroup.on("mouseover", function(data) {
//       toolTip.show(data);
//     })
//       // onmouseout event
//       .on("mouseout", function(data, index) {
//         toolTip.hide(data);
//       });
  
//     return circlesGroup;
//   }

//   d3.csv("assets/data/data.csv").then(function(fullData, err) {
//     console.log(fullData);
//     if(err) throw err;

//     fullData.forEach(function(data) {
//         data.poverty = +data.poverty;
//         data.healthcare = +data.healthcare;
//     });

//     var xLinearScale = d3.scaleLinear()
//     .range([0, width])
//     .domain(d3.max(fullData, data => data.poverty));

//     var yLinearScale = d3.scaleLinear()
//     .range([height, 0])
//     .domain([0, d3.max(fullData, data => data.healthcare)]);

//     var bottomAxis = d3.axisBottom(xLinearScale);
//     var leftAxis = d3.axisLeft(yLinearScale);

//     chartGroup.selectAll("circle")
//       .data(fulllData)
//       .enter()
//       .append("circle")
//       .attr("cx", d => xLinearScale(d.poverty))
//       .attr("cy", d => yLinearScale(d.healthcare))
//       .attr("r", "10")
//       .attr("fill", "blue")
//       .attr("stroke-width", "1")
//       .attr("stroke", "black");

//       chartGroup.append("g")
//       .classed("axis", true)
//       .call(leftAxis);
  
//       chartGroup.append("g")
//       .classed("axis", true)
//       .attr("transform", "translate(0, " + chartHeight + ")")
//       .call(bottomAxis);
//   })
//   .catch(function(error) {
//     console.log(error);
//   });


