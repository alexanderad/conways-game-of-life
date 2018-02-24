define(
  ["jquery", "d3", "app/torus-array", "app/rle-parser", "app/goodies"],
  function($, d3, TorusArray, RunLengthEncodedParser) {
    function Life(initialTorus) {
      /*
       * Represents a Life field.
       */

      // overall configuration
      var itemSize = 16,
        cellSize = itemSize - 1,
        margin = {
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        };

      // instance variables
      this.stepTime = 100;

      if (typeof initialTorus == "undefined") {
        // balance number of cells / width to fill screen
        this.rows = Math.floor($(".with-game-field").height() / itemSize);
        this.cols = Math.floor($(".with-game-field").width() / itemSize);
        this.torus = new TorusArray(this.rows, this.cols);
        this.markedCells = [];
        this.cellsAlive = 0;
      } else {
        this.torus = initialTorus;
        this.rows = this.torus.rows;
        this.cols = this.torus.cols;
        this.markedCells = [];
        for (var i = 0; i < this.torus.rows; i++) {
          for (var j = 0; j < this.torus.cols; j++) {
            this.markedCells.push(this.torus.absoluteIndex(i, j));
            if (this.torus.get(i, j) == 1) {
              this.cellsAlive++;
            }
          }
        }
      }

      this.gameTimer = undefined;
      this.generation = 0;
      this.id = Math.random();

      this.initGrid = function() {
        var width = this.cols * itemSize + margin.right + margin.left;
        var height = this.rows * itemSize + margin.top + margin.bottom;

        var svg = d3.select('svg[role="fieldmap"]');
        svg.attr("width", width).attr("height", height);

        var background = svg.select('rect[role="background"]');
        if (background.empty()) {
          background = svg.append("rect").attr("role", "background");
        }

        background
          .attr(
            "transform",
            "translate(" + (margin.left - 1) + "," + (margin.top - 1) + ")"
          )
          .attr("width", width - margin.left - margin.right + 1)
          .attr("height", height - margin.top - margin.bottom + 1)
          .attr("fill", "#ccc");

        var field = svg.select('g[role="field"]');
        if (field.empty()) {
          field = svg.append("g").attr("role", "field");
        }

        field.attr(
          "transform",
          "translate(" + margin.left + "," + margin.top + ")"
        );

        // add rows
        var rows = field.selectAll("g").data(this.torus.toArray());

        // for reinitialization, remove extra rows
        rows.exit().remove();

        rows
          .enter()
          .append("g")
          // shift each row from top by its number
          .attr("transform", function(d, i) {
            return "translate(0, " + itemSize * i + ")";
          });

        // for each row draw cells
        var rowCells = rows.selectAll().data(function(d) {
          return d;
        });

        // remove any previously added cells
        // FIXME: how to do that properly with .exit().remove()?
        field.selectAll("rect").remove();

        rowCells
          .enter()
          .append("rect")
          .attr("type", "cell")
          .attr("width", cellSize)
          .attr("height", cellSize)
          .attr("fill", function(d) {
            return d == 1 ? "#000" : "#fff";
          })
          .attr("x", function(d, i) {
            return itemSize * i;
          });

        // cell actions
        var cells = field.selectAll('rect[type="cell"]');

        var instance = this;
        cells.on("click", function(d, i) {
          instance.toggleCell(this, i);
        });

        cells.on("mouseover", function() {
          d3.select(this).attr("opacity", 0.35);
        });
        cells.on("mouseout", function() {
          d3.select(this).attr("opacity", 1);
        });

        console.log(
          "life.js: grid initialized from",
          initialTorus || "default torus"
        );
      };

      this.initGrid();
    } // end of life

    Life.fromRLEFile = function(fileData) {
      function getRLEData(parsedData, dataType) {
        for (var i = 0; i < parsedData.length; i++) {
          if (parsedData[i].type == dataType) {
            var data = parsedData[i];
            delete data["type"];
            return data;
          }
        }
      }

      var parsedData = RunLengthEncodedParser.parse(fileData);
      var lines = getRLEData(parsedData, "lines");
      var header = getRLEData(parsedData, "header");
      var torus = TorusArray.fromRLEData(header, lines);
      return new Life(torus);
    };

    Life.prototype.updateGrid = function() {
      /*
         * Updates the grid.
         */
      var startTime = performance.now();
      var grid = this.torus.toArray();
      var gridItems = d3.merge(grid);

      var svg = d3.select('[role="fieldmap"]');
      svg
        .selectAll('rect[type="cell"]')
        .data(gridItems)
        .transition()
        .duration(this.stepTime / 2)
        .attr("fill", function(d) {
          return d == 1 ? "#000" : "#fff";
        });

      // metrics
      var endTime = performance.now();
      $(this).trigger("updateGridFinished", [endTime - startTime]);
    };

    Life.prototype.markForScan = function(i, j, operation) {
      /*
         * Adds cell for scan on the next evolution step.
         */
      var candidates = this.torus.neighbors(i, j);
      candidates.push([i, j]);

      var instance = this;
      candidates = candidates.map(function(n) {
        return instance.torus.absoluteIndex(n[0], n[1]);
      });

      for (var k = 0; k < candidates.length; k++) {
        var index = this.markedCells.indexOf(candidates[k]);
        if (index == -1) {
          if (operation == "add") {
            this.markedCells.push(candidates[k]);
          }
        } else {
          if (operation == "remove") {
            this.markedCells.splice(index, 1);
          }
        }
      }
    };

    Life.prototype.toggleCell = function(cell, absoluteIndex) {
      /*
         * Changes single cell state.
         */

      var torusIndex = this.torus.arrayIndex(absoluteIndex);
      var row = torusIndex[0],
        col = torusIndex[1];

      var currentValue = this.torus.get(row, col);
      var newValue = currentValue == 1 ? 0 : 1;
      var operation = newValue == 1 ? "add" : "remove";

      d3.select(cell).attr("fill", newValue == 1 ? "#000" : "#fff");
      this.torus.set(row, col, newValue);
      this.markForScan(row, col, operation);
    };

    Life.prototype.evolve = function() {
      /*
         * Performs one step of evolution process.
         * Returns number of cells to scan on the next step.
         */
      if (this.markedCells.length == 0) {
        console.log("life.js: no cells marked for scan");
        return 0;
      }

      var startTime = performance.now();

      var nextTorus = new TorusArray(this.torus.rows, this.torus.cols);

      //var nextTorus = this.torusQueue.shift();

      var cellsSeen = 0,
        cellsAlive = 0;

      function checkCell(instance, i, j) {
        var neighbors = instance.torus.neighbors(i, j);
        var neighborsState = neighbors.map(function(currValue) {
          return instance.torus.get(currValue[0], currValue[1]);
        });

        var population = neighborsState.reduce(function(prevValue, currValue) {
          return prevValue + currValue;
        });

        // new born
        if (instance.torus.get(i, j) == 0 && population == 3) {
          nextTorus.set(i, j, 1);
          instance.markForScan(i, j, "add");
          cellsAlive++;
        }

        if (instance.torus.get(i, j) == 1) {
          // loneliness or overpopulation
          if (population < 2 || population > 3) {
            nextTorus.set(i, j, 0);
          } else {
            // lucky cell
            nextTorus.set(i, j, 1);
            instance.markForScan(i, j, "add");
            cellsAlive++;
          }
        }
        cellsSeen++;
      }

      // scan only marked
      var markedCells = this.markedCells;
      this.markedCells = [];
      for (var k = 0; k < markedCells.length; k++) {
        var cell = this.torus.arrayIndex(markedCells[k]);
        checkCell(this, cell[0], cell[1]);
      }

      // swap torus
      //this.torusQueue.push(this.torus);
      this.torus = nextTorus;
      this.cellsAlive = cellsAlive;
      this.generation++;

      // metrics
      var endTime = performance.now();
      $(this).trigger("evolutionStepFinished", [
        endTime - startTime,
        this.generation,
        this.cellsAlive
      ]);

      this.updateGrid();
      console.log(
        "life.js:",
        "cells seen",
        cellsSeen,
        "cellsAlive",
        cellsAlive,
        "cells to see next round",
        this.markedCells.length
      );

      return this.markedCells;
    };

    return Life;
  }
);
