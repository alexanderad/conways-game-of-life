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
      .duration(150)
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
    for(var i = 0; i < currentTorus.width; i++) {
      for(var j = 0; j < currentTorus.height; j++) {
        var neighbors = currentTorus.neighbors(i, j).map(function(currValue) {
          return currentTorus.get(currValue[0], currValue[1]);
        });

        var population = neighbors.reduce(function(prevValue, currValue) {
          return prevValue + currValue;
        });

        // в пустой (мёртвой) клетке, рядом с которой ровно три живые клетки, 
        // зарождается жизнь;
        if(currentTorus.get(i, j) == 0 && population == 3) {
          nextTorus.set(i, j, 1);
        }
        
        if(currentTorus.get(i, j) == 1) {
          if(population < 2 || population > 3) {
            // если соседей меньше двух или больше трёх) клетка умирает 
            // («от одиночества» или «от перенаселённости»)
            nextTorus.set(i, j, 0);  
          }
          else {
            // если у живой клетки есть две или три живые соседки, то эта клетка 
            // продолжает жить;
            nextTorus.set(i, j, 1);
          }
        }
      };
    };
    return nextTorus;
  };

  TorusArray = modules.TorusArray;

  var w = 50,
      h = 16;

  lifeTorus = new TorusArray(w, h);
  lifeTorus.set(5, 3, 1);
  lifeTorus.set(5, 4, 1);
  lifeTorus.set(5, 5, 1);
  lifeTorus.set(4, 5, 1);
  lifeTorus.set(3, 4, 1);
  

  initGrid(lifeTorus);
  updateGrid(lifeTorus);

  d3.select('#id_green_btn').on('click', function() {
    console.log("green btn click");
    lifeTorus = stepEvolution(lifeTorus);
    updateGrid(lifeTorus);
  });

})();