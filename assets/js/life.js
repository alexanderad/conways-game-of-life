(function(){

  $(document).on('evolutionStepFinished', {}, function(event,
    timeTaken, generation, cellsAlive) {
      $('#id_stats_step_evolution_ms').text(timeTaken.toFixed(0));
      $('#id_stats_generation').text(generation);
      $('#id_stats_cells_alive').text(cellsAlive);
  });

  $(document).on('updateGridFinished', {}, function(event, timeTaken) {
      $('#id_stats_render_grid_ms').text(timeTaken.toFixed(0));
  });

  function initGrid(torus) {
    // field configuration
    var itemSize = 15,
        cellSize = itemSize - 1,
        margin = {
          top: 20,
          left: 20,
          right: 4,
          bottom: 4
        };

    var yAxisScale = d3.scale.linear()
          .range([0, itemSize * (torus.rows - 1)])
          .domain([1, torus.rows]),
        yAxis = d3.svg.axis()
          .orient('left')
          .ticks(torus.rows)
          .scale(yAxisScale);

    var xAxisScale = d3.scale.linear()
          .range([0, itemSize * (torus.cols - 1)])
          .domain([1, torus.cols]),
        xAxis = d3.svg.axis()
          .orient('top')
          .ticks(torus.cols)
          .scale(xAxisScale);

    var width = (torus.cols * itemSize) + margin.right + margin.left;
    var height = (torus.rows * itemSize) + margin.top + margin.bottom;

    var svg = d3.select('[role="fieldmap"]');

    // Y axis
    svg.append('g')
      .attr('transform', 
            'translate('+ (margin.left + 5 ) + ',' + (margin.top + cellSize / 2) + ')')
      .attr('class', 'axis')
      .call(yAxis);

    // X axis
    svg.append('g')
      .attr('transform', 
            'translate('+ (margin.left + cellSize / 2 ) + ',' + (margin.top + 5) + ')')
      .attr('class', 'axis')
      .call(xAxis);

    svg.append('rect') // this is background for all cells
      .attr('transform', 
            'translate(' + (margin.left - 1) + ',' + (margin.top - 1) + ')')
      .attr('width', width - margin.left - margin.right + 1)
      .attr('height', height - margin.top - margin.bottom + 1)
      .attr('fill', '#ccc');

    var fieldmap = svg
      .attr('width',  width)
      .attr('height', height)
      .append('g') // group for all cells
      .attr('role', 'field')
      .attr('transform', 
            'translate(' + (margin.left) + ',' + (margin.top) + ')');

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
      .attr('type', 'cell')
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('fill', '#ffffff')
      .attr('data-value', function(d) {
        return d;
      })
      .attr('x', function(d, i){
        return itemSize * i;
      });

    cells = svg.selectAll('rect[type="cell"]');
    // console.log(cells);
    cells.on('click', function(d, i) {
      rect = d3.select(cells[0][i])
      toggleCell(rect, i);
    });
  };

  function toggleCell(rect, i) {
      var row = Math.floor(i / lifeTorus.cols);
      var col = i % lifeTorus.cols;

      var currentValue = lifeTorus.get(row, col);
      var newValue = currentValue == 1 ? 0 : 1;
      rect.attr('fill', newValue == 1 ? '#000' : '#fff');
      lifeTorus.set(row, col, newValue);
  };

  function colorizeGrid() {
    var svg = d3.select('[role="fieldmap"]');
    var items = svg.selectAll('rect[type="cell"]')
      .transition()
      .duration(150)
      .attr('fill', function(d) {
       return d == 1 ? '#000' : '#fff';
      });
  };

  function updateGrid(torus) {
    var startTime = performance.now();
    var grid = torus.toArray();
    var gridItems = d3.merge(grid);

    var svg = d3.select('[role="fieldmap"]');
    var items = svg.selectAll('rect[type="cell"]')
      .data(gridItems)
      .attr('data-value', function(d) {
        return d;
      });
    colorizeGrid();

    // metrics
    var endTime = performance.now();
    $(document).trigger('updateGridFinished', [endTime - startTime]);

  };

  function stepEvolution(currentTorus) {
    var startTime = performance.now();
    var cellsAlive = 0;
    var nextTorus = new TorusArray(currentTorus.rows, currentTorus.cols);
    for(var i = 0; i < currentTorus.rows; i++) {
      for(var j = 0; j < currentTorus.cols; j++) {
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
          cellsAlive++;
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
            cellsAlive++;
          }
        }
      };
    };

    // metrics
    var endTime = performance.now()
    generation++;
    $(document).trigger('evolutionStepFinished', [
      endTime - startTime,
      generation,
      cellsAlive
    ]);
    

    return nextTorus;
  };


  // globals
  TorusArray = modules.TorusArray;

  var rows = 25,
      cols = 35,
      generation = 0,
      gameTimer = 0;

  lifeTorus = new TorusArray(rows, cols);  

  initGrid(lifeTorus);
  updateGrid(lifeTorus);

  $('#id_toggle_btn').click(function() {
    var btn = $('#id_toggle_btn');
    var btn_span = $('#id_toggle_btn > span');
    if(btn.hasClass('btn-success')) {
      gameTimer = setInterval(function() {
        lifeTorus = stepEvolution(lifeTorus);
        updateGrid(lifeTorus);
      }, 100);

      btn.removeClass('btn-success').addClass('btn-danger');
      btn_span.removeClass("glyphicon-play").addClass("glyphicon-pause");
    }
    else {
      clearTimeout(gameTimer);
      
      btn.removeClass('btn-danger').addClass('btn-success');
      btn_span.removeClass("glyphicon-pause").addClass("glyphicon-play");
    };
  });

  $(".field-presets-container a").click(function(event) {
    var item = $(event.target);
    var preset = presets[item.attr('data-group')][item.attr('data-key')];
    var presetArray = TorusArray.decompress(preset);
    presetArray.zfill2d(lifeTorus.rows, lifeTorus.cols);
    lifeTorus.setArray(presetArray);
    updateGrid(lifeTorus);
  });

  $("#id_preset_empty").click(function(event) {
    lifeTorus.setArray(
      new TorusArray(lifeTorus.rows, lifeTorus.cols).toArray()
    );
    updateGrid(lifeTorus);
  });

})();