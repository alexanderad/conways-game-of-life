define(["jquery", "d3", "app/torus-array", "app/goodies"], function($, d3, TorusArray, ignore) {

    function Life() {
        /*
         * Represents a Life field.
         */

        // overall configuration
        var itemSize = 15,
            cellSize = itemSize - 1,
            margin = {
                top: 0,
                left: 0,
                right: 0,
                bottom: 0
            };

        // instance variables
        this.stepTime = 100;

        // balance number of cells / width to fill screen
        this.rows = Math.floor(window.height / itemSize);
        this.cols = Math.floor(window.width / itemSize);

        this.torusQueue = [
            new TorusArray(this.rows, this.cols),
            new TorusArray(this.rows, this.cols)
        ];
        this.torus = this.torusQueue[0];

        this.generation = 0;
        this.cellsAlive = 0;
        this.markedCells = undefined;

        this.initGrid = function() {
            var width = (this.cols * itemSize) + margin.right + margin.left;
            var height = (this.rows * itemSize) + margin.top + margin.bottom;

            var svg = d3.select('[role="fieldmap"]');

            // all cells background
            svg.append('rect')
                .attr('transform',
                    'translate(' + (margin.left - 1) + ',' + (margin.top - 1) + ')')
                .attr('width', width - margin.left - margin.right + 1)
                .attr('height', height - margin.top - margin.bottom + 1)
                .attr('fill', '#ccc');

            var fieldmap = svg
                .attr('width', width)
                .attr('height', height)
                .append('g') // group for all cells
                .attr('role', 'field')
                .attr('transform',
                    'translate(' + (margin.left) + ',' + (margin.top) + ')');

            // add rows
            var rows = fieldmap.selectAll('g')
                .data(this.torus.toArray())
                .enter()
                .append('g')
                // shift each row from top by its number
                .attr('transform', function (d, i) {
                    return 'translate(0, ' + itemSize * i + ')';
                });

            // for each row draw cells
            rows.selectAll()
                .data(function (d) {
                    return d;
                })
                .enter()
                .append('rect')
                .attr('type', 'cell')
                .attr('width', cellSize)
                .attr('height', cellSize)
                .attr('fill', '#ffffff')
                .attr('x', function (d, i) {
                    return itemSize * i;
                });

            // cell actions
            var cells = svg.selectAll('rect[type="cell"]');

            var instance = this;
            cells.on('click', function(d, i) {
                instance.toggleCell(this, i);
            });

            cells.on('mouseover', function () {
                d3.select(this).attr('opacity', .35);
            });
            cells.on('mouseout', function () {
                d3.select(this).attr('opacity', 1);
            });

            console.log("life.js: grid initialized");
        };

        this.initGrid();
    } // end of life

    Life.prototype.colorizeGrid = function () {
        /*
         * Applies colors to grid.
         */
        var svg = d3.select('[role="fieldmap"]');
        svg.selectAll('rect[type="cell"]')
            .transition()
            .duration(this.stepTime)
            .attr('fill', function (d) {
                return d == 1 ? '#000' : '#fff';
            });
    };

    Life.prototype.updateGrid = function () {
        /*
         * Updates the grid.
         */
        var startTime = performance.now();
        var grid = this.torus.toArray();
        var gridItems = d3.merge(grid);

        var svg = d3.select('[role="fieldmap"]');
        svg.selectAll('rect[type="cell"]')
            .data(gridItems);

        this.colorizeGrid();

        // metrics
        var endTime = performance.now();
        this.trigger('updateGridFinished', [endTime - startTime]);
    };

    Life.prototype.markForScan = function (i, j) {
        /*
         * Adds cell for scan on the next evolution step.
         */
        var candidates = this.torus.neighbors(i, j);
        candidates.push([i, j]);

        var instance = this;
        candidates = candidates.map(function (n) {
            return instance.torus.absoluteIndex(n[0], n[1]);
        });

        for (var k = 0; k < candidates.length; k++) {
            if (this.markedCells.indexOf(candidates[k]) == -1) {
                this.markedCells.push(candidates[k]);
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

//
//        /*
//         if (1 == newValue) {
//         mark
//         }
//         else {
//         var index = scanCells.indexOf(i);
//         if (index > -1) {
//         scanCells.splice(index, 1);
//         }
//         }
//         */
//
        d3.select(cell).attr('fill', newValue == 1 ? '#000' : '#fff');
        this.torus.set(row, col, newValue);
    };

    Life.prototype.evolve = function() {
        /*
         * Performs one step of evolution process.
         */

        console.log("call to prototype", this);
        var startTime = performance.now();

        var nextScanCells = [];
        var nextTorus = this.torusQueue.shift();

        var cellsSeen = 0,
            cellsAlive = 0;

        function checkCell(i, j) {
            var neighbors = this.torus.neighbors(i, j);
            var neighborsState = neighbors.map(function (currValue) {
                return this.torus.get(currValue[0], currValue[1]);
            });

            var population = neighborsState.reduce(function (prevValue, currValue) {
                return prevValue + currValue;
            });

            // new born
            if (this.torus.get(i, j) == 0 && population == 3) {
                nextTorus.set(i, j, 1);
                this.markForScan(i, j);
                cellsAlive++;
            }

            if (this.torus.get(i, j) == 1) {
                // loneliness or overpopulation
                if (population < 2 || population > 3) {
                    nextTorus.set(i, j, 0);
                }
                else {
                    // lucky cell
                    nextTorus.set(i, j, 1);
                    markForScan(i, j);
                    cellsAlive++;
                }
            }
            cellsSeen++;
        }

        if(typeof this.markedCells == "undefined") {
            // scan whole field
            for (var i = 0; i < this.torus.rows; i++) {
                for (var j = 0; j < this.torus.cols; j++) {
                    checkCell.call(this, i, j);
                }
            }
        }
        else {
            // scan only marked
            for(var k = 0; k < scanCells.length; k++) {
                var cell = currentTorus.arrayIndex(scanCells[k]);
                checkCell.call(this, cell[0], cell[1]);
            }
        }

        // swap torus
        this.torusQueue.push(this.torus);
        this.torus = nextTorus;
        this.cellsAlive = cellsAlive;
        this.generation++;

        // metrics
        var endTime = performance.now();
        $(document).trigger(
            'evolutionStepFinished', [
            endTime - startTime,
            this.generation,
            this.cellsAlive
        ]);

        console.log("cells seen", cellsSeen, "cellsAlive", cellsAlive, "next round to see", nextScanCells.length);
    };


    return Life;
});
