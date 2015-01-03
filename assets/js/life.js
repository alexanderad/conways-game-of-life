(function(){

    window.performance = (window.performance || {
        offset: Date.now(),
        now: function now(){
            return Date.now() - this.offset;
        }
    });

  $(document).on('evolutionStepFinished', {}, function(
      event, time_taken, generation, cells_alive) {
      $('#id_stats_step_evolution_ms').text(time_taken.toFixed(0));
      $('#id_stats_generation').text(generation);
      $('#id_stats_cells_alive').text(cells_alive);
  });

  $(document).on('updateGridFinished', {}, function(event, time_taken) {
      $('#id_stats_render_grid_ms').text(time_taken.toFixed(0));
  });

  function initGrid(torus) {
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

    all_rects = svg.selectAll('rect');
    all_rects.on('click', function(d, i) {
      rect = d3.select(all_rects[0][i])
      toggleCell(rect, i);
    });
  };

  function toggleCell(rect, i) {
      var row = Math.floor(i / lifeTorus.width);
      var col = i % lifeTorus.width;

      var current_value = lifeTorus.get(row, col);
      var new_value = current_value == 1 ? 0 : 1;
      rect.attr('fill', new_value == 1 ? '#000' : '#fff');
      lifeTorus.set(row, col, new_value);
  };

  function colorizeGrid() {
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
    var start_time = performance.now();
    var grid = torus.toArray();
    var gridItems = d3.merge(grid);

    var svg = d3.select('[role="fieldmap"]');
    var items = svg.selectAll('rect')
      .data(gridItems)
      .attr('data-value', function(d) {
        return d;
      });
    colorizeGrid();

    // metrics
    var end_time = performance.now();
    $(document).trigger('updateGridFinished', [end_time - start_time]);

  };

  function stepEvolution(currentTorus) {
    console.log("step evolution", generation);
    var start_time = performance.now();
    var cells_alive = 0;
    var nextTorus = new TorusArray(currentTorus.width, currentTorus.height);
    for(var i = 0; i < currentTorus.height; i++) {
      for(var j = 0; j < currentTorus.width; j++) {
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
          cells_alive++;
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
            cells_alive++;
          }
        }
      };
    };

    // metrics
    var end_time = performance.now()
    generation++;
    $(document).trigger('evolutionStepFinished', [
      end_time - start_time,
      generation,
      cells_alive
    ]);
    

    return nextTorus;
  };


  // globals
  TorusArray = modules.TorusArray;

  var w = 35,
      h = 25,
      generation = 0,
      gameTimer = 0;

  lifeTorus = new TorusArray(w, h);

  // GLIDER
  // lifeTorus.set(5, 3, 1);
  // lifeTorus.set(5, 4, 1);
  // lifeTorus.set(5, 5, 1);
  // lifeTorus.set(4, 5, 1);
  // lifeTorus.set(3, 4, 1);


  

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

      btn.removeClass('btn-success').addClass('btn-warning');
      btn_span.removeClass("glyphicon-play").addClass("glyphicon-pause");
    }
    else {
      clearTimeout(gameTimer);
      
      btn.removeClass('btn-warning').addClass('btn-success');
      btn_span.removeClass("glyphicon-pause").addClass("glyphicon-play");
    };
  });

})();