// main function of program, using D3 to create force directed graph
function main(dataSet) {
  const width = 1200; // svg width
  const height = 600; // svg height
  const fWidth = 16; // flag/rect width
  const fHeight = 11; // flag/rect height
  const { nodes, links } = dataSet; // destructuring to obtain desired arrays of data
  const simulation = d3.forceSimulation();
  // controls drag event initialization within graph
  function dragStart(d) {
    // "reheats" simulation if currently inactive, on drag initialization
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  // controls drag event in process
  function dragging(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  // controls drag event end
  function dragEnd(d) {
    if (!d3.event.active) simulation.alphaTarget(0.02);
    d.fx = null; // allows elasticity in dragged node
    d.fy = null; // allow elasticity in dragged node
  }
  // appends svg with declared attributes to #main div
  const svg = d3.select('#main')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .classed('svg', true);
  // appends defs to svg, followed by patterns for flag png use
  const defs = svg.append('defs')
    .selectAll('pattern')
    .data(flags) // flag data from separate js file
    .enter()
    .append('pattern') 
    .attr('width', fWidth)
    .attr('height', fHeight)
    .attr('id', d => `pattern_${d.code}`); // assigns individual id based on country code
  // appends images to defs of individual flags from png
  defs.append('image')
    .attr('xlink:href', 'Assets/Images/flags.png') 
    // coordinates for targeting particular flags of png by bringing it to 0, 0 of rect
    .attr('x', d => -d.x)
    .attr('y', d => -d.y)  
    .attr('width', '256')
    .attr('height', '176');
  // generates links
  const linkControl = svg.append('g')
    .classed('links', true)
    .selectAll('line')
    .data(links)
    .enter()
    .append('line');
  // generates nodes/rects
  const nodeControl = svg.append('g')
    .classed('nodes', true)
    .selectAll('rect')
    .data(nodes)
    .enter()
    .append('rect')
    .attr('width', fWidth)
    .attr('height', fHeight)
    .attr('fill', d => `url(#pattern_${d.code})`) // fills flag based on flag code
    .call(d3.drag()
      .on('start', dragStart)
      .on('drag', dragging)
      .on('end', dragEnd));
  // force simulation
  simulation
    .nodes(nodes)
    .force('center', d3.forceCenter() // centers force on nodes to midpoint of svg
      .x(width / 2)
      .y(height / 2))
    .force('links', d3.forceLink(links) // sets link distances
      .distance(125))
    .velocityDecay(1) // sets friction on simulation
    // repositions nodes during simulation
    .on('tick', () => {
      nodeControl
        .attr('x', d => d.x = Math.max(0, Math.min(width - fWidth, d.x)))
        .attr('y', d => d.y = Math.max(0, Math.min(height - fHeight, d.y)));
      // links follow their source and target nodes through simulation
      linkControl
        .attr('x1', d => d.source.x + (fWidth / 2))
        .attr('y1', d => d.source.y + (fHeight / 2))
        .attr('x2', d => d.target.x + (fWidth / 2))
        .attr('y2', d => d.target.y + (fHeight / 2));
    });
  // controls forces to initially and subsequently "decluster" data nodes
  $('#buttonOne').click(() => {
    simulation
      .force('yForce', d3.forceY() // y force to horizontally separate nodes
        .strength(0.03)
        .y(height / 2))
      .force('xForce', null) // negates any x force (following cluster button click)
      .force('charge', d3.forceManyBody() // adds repulsive charge
        .strength(-20))
      .velocityDecay(0.5) // sets friction on simulation
      .alpha(1) // reinitializes simulation
      .restart();
  });
  // controls forces to cluster data nodes following declustering
  $('#buttonTwo').click(() => {
    simulation
      .force('xForce', d3.forceX() // forces nodes together
        .strength(0.03)
        .x(height / 2))
      .force('charge', d3.forceManyBody() // adds attractive charge
        .strength(0.5))
      .velocityDecay(0.3)
      .alpha(1) // reinitializes simulation
      .restart();
  });
  // tooltip
  const tooltip = d3.select('body')
    .append('div')
    .classed('tooltip', true);
  // reveals tooltip data for nodes
  function tooltipOn(d) {
    d3.event.preventDefault();
    tooltip
      .style('left', `${d3.event.x}px`)
      .style('top', `${d3.event.y - 40}px`) // positions tip above hover point
      .style('opacity', '0.95')
      .html(`<p>${d.country}</p>`); // country name
  }
  // hides tooltip data display
  function tooltipOff() {
    d3.event.preventDefault();
    tooltip
      .style('opacity', '0');
  }
  // tooltip activation/deactivation
  nodeControl
    .on('mousemove', tooltipOn)
    .on('touchstart', tooltipOn)
    .on('mouseout', tooltipOff)
    .on('touchend', tooltipOff);
}
// AJAX
const makeRequest = async () => {
  const url = 'https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json';
  await $.getJSON(url, (results) => {
    main(results); // calls main function passing in data
  });
};
// initialization on page load
document.addEventListener('DOMContentLoaded', makeRequest());

//  copyright year dynamic update
const yearSpan = document.querySelector('#year');
//  updates year using date object and built in method
yearSpan.innerHTML = `${new Date().getFullYear()}`;
