(function(){
// field configuration
var itemSize = 18,
    cellSize = itemSize - 1,
    margin = {
      top: 4,
      left: 4,
      right: 4,
      bottom: 4
    };

  data = [
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1],
    [0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1],
    [0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0],
    [1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0],
  ];

  
  // get params of matrix
  rows = data.length;
  cols = data[0].length;
  width = (cols * itemSize) + margin.right + margin.left;
  height = (rows * itemSize) + margin.top + margin.bottom;

  var svg = d3.select('[role="fieldmap"]');

  var fieldmap = svg
    .attr('width',  width)
    .attr('height', height)
    .append('g')
    .attr('width', width - margin.left - margin.right)
    .attr('height', height - margin.top - margin.bottom)
    .attr('fill', '#fff')
    .attr('transform', 
          'translate(' + margin.left + ',' + margin.top + ')');

  // add row data
  var row = fieldmap.selectAll('g')
    .data(data)
    .enter()
    .append('g')
    .attr('transform', function(d, i) {
      return 'translate(0, ' + itemSize * i + ')';
    });

  // in row draw cells
  row.selectAll('rect')
    .data(function(d) { return d; })
    .enter()
    .append('rect')
    .attr('width', cellSize)
    .attr('height', cellSize)
    .attr('x', function(d, i){
      return itemSize * i;
    });

  // paint all
  fieldmap.selectAll('rect')
    .transition()
    .delay(100)
    .duration(700)
    .attrTween('fill', function(d, i, a) {
        return d3.interpolate(
          '#fff', d == 1 ? '#000' : '#fff'
        );
    });
})();