(function(){

  function initGrid(torus) {
    console.log("[i] initializing grid with torus array", torus);
  
    // field configuration
    var itemSize = 15,
        cellSize = itemSize - 1,
        margin = {
          top: 4,
          left: 4,
          right: 4,
          bottom: 4
        };

    var width = (torus.width * itemSize) + margin.right + margin.left;
    var height = (torus.height * itemSize) + margin.top + margin.bottom;

    var svg = d3.select('[role="fieldmap"]');

    var fieldmap = svg
      .attr('width',  width)
      .attr('height', height)
      .style('background-color', '#ccc')
      .append('g')
      .attr('width', width - margin.left - margin.right)
      .attr('height', height - margin.top - margin.bottom)
      .attr('fill', '#fff')
      .attr('transform', 
            'translate(' + margin.left + ',' + margin.top + ')');

    var grid = torus.toArray();
    
    // add rows
    var rows = fieldmap.selectAll('g')
      .data(grid)
      .enter()
      .append('g')
      // shift each row from top by its number
      .attr('transform', function(d, i) {
        return 'translate(0, ' + itemSize * i + ')';
      });

    // for each row draw cells
    rows.selectAll()
      .data(function(d) { return d; })
      .enter()
      .append('rect')
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('fill', '#ffffff')
      .attr('data-value', function(d) {
        return d;
      })
      .attr('x', function(d, i){
        return itemSize * i;
      });
  };

  function colorizeGrid() {
    console.log('[i] colorizing grid');
    var svg = d3.select('[role="fieldmap"]');
    var items = svg.selectAll('rect')
      .transition()
      // .delay(function(d, i) {
      //   var duration = 100;
      //   return i / 100 * duration;
      // })
      .duration(700)
      .attr('fill', function(d) {
        return d == 1 ? '#000' : '#fff';
      });
      // .attrTween('fill', function(d, i, a) {
      //     return d3.interpolate(
      //       '#fff',
      //       d == 1 ? '#fff' : '#000',
      //       //d == 1 ? '#000' : '#fff'
      //     );
      // });
  };

  function updateGrid(torus) {
    console.log('[i] updating grid')
    var grid = torus.toArray();
    var gridItems = d3.merge(grid);

    var svg = d3.select('[role="fieldmap"]');
    var items = svg.selectAll('rect')
      .data(gridItems)
      .attr('data-value', function(d) {
        return d;
      });
    colorizeGrid();
  };

  function stepEvolution(currentTorus) {
    var nextTorus = new TorusArray(currentTorus.width, currentTorus.height);
    return nextTorus;
  };

  TorusArray = modules.TorusArray;

  var w = 10,
      h = 10;

  var lifeTorus = new TorusArray(w, h);
  lifeTorus.set(4, 3, 1);
  lifeTorus.set(4, 4, 1);
  lifeTorus.set(4, 5, 1);

  initGrid(lifeTorus);
  updateGrid(lifeTorus);

  d3.select('#id_green_btn').on('click', function() {
    console.log("green btn click");
    lifeTorus = stepEvolution(lifeTorus);
    updateGrid(lifeTorus);
  });

  d3.select('#id_blue_btn').on('click', function() {
    console.log("blue btn click");
  });

})();