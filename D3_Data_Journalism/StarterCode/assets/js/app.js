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
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}

function yScale(data, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
        d3.max(data, d => d[chosenYAxis]) * 1.2
      ])
      .range([height, 0]);
  
    return yLinearScale;
  }

// function used for updating xAxis var upon click on axis label
function renderxAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

function renderyAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    // .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  var label;

  if (chosenXAxis === "poverty") {
    label = "In Poverty (%)";
  }
  else if (chosenXAxis === "Age") {
    label = "Age (Median)";
  }
  else if (chosenXAxis=== "income") {
      label = "Household Income (Median)";
  }
//   else if (chosenYAxis === "healthcare") {
//       label = "Lacks Healthcare (%)";
//   }
//   else if (chosenYAxis === "Smokes") {
//       label = "Smokes (%)";
//   }
//   else if (chosenYAxis === "obese") {
    //   label = "Obese (%)"
//   }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -80])
    .html(function(d) {
      return (`${d.state}<br>${label} ${d[chosenXAxis]} <br> Lacks Healthcare (%) ${d.healthcare}<br>`);
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
    data.income = +data.income;
    data.smokes = +data.smokes
    data.healthcare = +data.healthcare
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

//   var yAxis = chartGroup.append("g")
//     .classed("y-axis", true)
//     .attr("transform", `translate(0, ${width})`)
//     .call(leftAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(fullData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", 20)
    .attr("fill", "lightblue")
    .attr("stroke", "teal")
    .attr("stroke-width", 4)
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

    var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

    // var healthcareLabel = labelsGroup.append("text")
    // .attr("x", 20)
    // .attr("y", 0)
    // .attr("transform", "rotate(-90)")
    // .attr("value", "healthcare") // value to grab for event listener
    // .classed("inactive", false)
    // .text("Lacks Healthcare (%)");

    // var smokesLabel = labelsGroup.append("text")
    // .attr("x", 40)
    // .attr("y", 0)
    // .attr("transform", "rotate(-90)")
    // .attr("value", "smokes") // value to grab for event listener
    // .classed("inactive", true)
    // .text("Smokes (%)");

    // var obeseLabel = labelsGroup.append("text")
    // .attr("x", 60)
    // .attr("y", 0)
    // .attr("transform", "rotate(-90)")
    // .attr("value", "obese") // value to grab for event listener
    // .classed("inactive", true)
    // .text("Obese (%)");

//   append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Lacks Healthcare (%)");

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
        xAxis = renderxAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis=== "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "income") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
}).catch(function(error) {
  console.log(error);
});



// Attempt with Tutor... 

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

// First Attempt by myself

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


