 // Set data variable
var dataURL = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json';
var dataResult = '';


// Call the API and store the JSON result as a string
req = new XMLHttpRequest();
req.open("GET", dataURL, true);
req.send();
req.onload = function () {
  json = JSON.parse(req.responseText);
  dataResult = JSON.stringify(json);
  document.getElementsByClassName('infoHolder')[0].innerHTML = dataResult;
};

// Set Dimension Variables for the Graph
var yMargin = 40,
width = 800,
height = 400,
barWidth = width / 275;

// Set tooltip (this will reposition for each bar when hovered over)
var tooltip = d3.select('.visHolder').
append('div').
attr('id', 'tooltip').
style('opacity', 0);

// Set bar graph overlay 'overlay'
var overlay = d3.select('.visHolder').
append('div').
attr('class', 'overlay').
style('opacity', 0);

// Set Scalor Vector Graphics container
var svgContainer = d3.select('.visHolder').
append('svg').
attr('width', width + 100).
attr('height', height + 60);

// Set the JSON object (or this could be an API...)
d3.json(dataURL, function (err, data) {

  // log the data to the console
  console.log(data.data);

  // append the text desciption of unit quantity
  svgContainer.append('text').
  attr('transform', 'rotate(-90)').
  attr('x', -200).
  attr('y', 80).
  text('Gross Domestic Product');

  // append the infomrational text under the x axis on the right
  svgContainer.append('text').
  attr('x', width / 2 + 150).
  attr('y', height + 50).
  text('More Information: http://www.bea.gov/national/pdf/nipaguid.pdf').
  attr('class', 'info');

  // Working with dates
  // Get the year and derive the quarter from the month part of the date string
  var years = data.data.map(function (item) {
    var quarter;
    var temp = item[0].substring(5, 7);

    if (temp === '01') {
      quarter = 'Q1';
    } else
    if (temp === '04') {
      quarter = 'Q2';
    } else
    if (temp === '07') {
      quarter = 'Q3';
    } else
    if (temp === '10') {
      quarter = 'Q4';
    }

    return item[0].substring(0, 4) + ' ' + quarter;
  }); // End years and quarters

  // Get method for years
  var yearsDigits = years.map(function (item) {
    return item.substring(0, 4);
  });

  // Set the X axis scale for the graph based on the min and max values of the years (domain)
  var xScale = d3.scaleLinear().
  domain([d3.min(yearsDigits), d3.max(yearsDigits)]).
  range([0, width]);

  // Set the xAxis according to the xScale above
  var xAxis = d3.axisBottom().
  scale(xScale).
  tickFormat(d3.format("d"));

  // Append the xAxis group to the SVG image
  var xAxisGroup = svgContainer.append('g').
  call(xAxis).
  attr('id', 'x-axis').
  attr('transform', 'translate(60, 400)');

  // Get method for the GDP in the JSON string
  var GDP = data.data.map(function (item) {
    return item[1];
  });

  var scaledGDP = [];

  var gdpMin = d3.min(GDP);
  var gdpMax = d3.max(GDP);

  // Set the domain and range for the GDP (Y Axis)
  var linearScale = d3.scaleLinear().
  domain([gdpMin, gdpMax]).
  range([gdpMin / gdpMax * height, height]);

  // Return method for the scaled GDP
  scaledGDP = GDP.map(function (item) {
    return linearScale(item);
  });

  // Set the yAxis Scale according to the domain and range
  var yAxisScale = d3.scaleLinear().
  domain([gdpMin, gdpMax]).
  range([height, gdpMin / gdpMax * height]);

  var yAxis = d3.axisLeft(yAxisScale);

  // Append the yScale to the SVG image  
  var yAxisGroup = svgContainer.append('g').
  call(yAxis).
  attr('id', 'y-axis').
  attr('transform', 'translate(60, 0)');

  // Append all data bars to the svg element and apply styling and attributes
  d3.select('svg').selectAll('rect').
  data(scaledGDP).
  enter().
  append('rect').
  attr('data-date', function (d, i) {
    return data.data[i][0];
  }).
  attr('data-gdp', function (d, i) {
    return data.data[i][1];
  }).
  attr('class', 'bar').
  attr('x', function (d, i) {
    return i * barWidth;
  }).
  attr('y', function (d, i) {
    return height - d;
  }).
  attr('width', barWidth).
  attr('height', function (d) {
    return d;
  }).
  style('fill', '#33adff').
  attr('transform', 'translate(60, 0)').
  on('mouseover', function (d, i) {
    overlay.transition().
    duration(0).
    style('height', d + 'px').
    style('width', barWidth + 'px').
    style('opacity', .9).
    style('left', i * barWidth + 0 + 'px').
    style('top', height - d + 'px').
    style('transform', 'translateX(60px)');
    tooltip.transition().
    duration(200).
    style('opacity', .9);
    tooltip.html(years[i] + '<br>' + '$' + GDP[i].toFixed(1).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') + ' Billion').
    attr('data-date', data.data[i][0]).
    style('left', i * barWidth + 30 + 'px').
    style('top', height - 100 + 'px').
    style('transform', 'translateX(60px)');
  }).
  on('mouseout', function (d) {
    tooltip.transition().
    duration(200).
    style('opacity', 0);
    overlay.transition().
    duration(200).
    style('opacity', 0);
  });

}); // End of D3 object