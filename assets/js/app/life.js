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
    this.markedCells = [];

    function swapTorus() {
        this.torusQueue.push(this.torus);
        this.torus = this.torusQueue.shift();
    }

    function initGrid() {
        /*
         * Grid initializer.
         */
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
        cells.on('click', function (d, i) {
            var rect = d3.select(cells[0][i]);
            toggleCell(rect, i);
        });
        cells.on('mouseover', function (d, i) {
            var rect = d3.select(cells[0][i]);
            rect.attr('opacity', .35);
        });
        cells.on('mouseout', function (d, i) {
            var rect = d3.select(cells[0][i]);
            rect.attr('opacity', 1)
        });
    }

    function toggleCell(rect, i) {
        var torusIndex = this.torus.arrayIndex(i);
        var row = torusIndex[0],
            col = torusIndex[1];

        var currentValue = this.torus.get(row, col);
        var newValue = currentValue == 1 ? 0 : 1;

        /*
        if (1 == newValue) {
            mark
        }
        else {
            var index = scanCells.indexOf(i);
            if (index > -1) {
                scanCells.splice(index, 1);
            }
        }
        */

        rect.attr('fill', newValue == 1 ? '#000' : '#fff');
        this.torus.set(row, col, newValue);
    }

    function colorizeGrid() {
        var svg = d3.select('[role="fieldmap"]');
        svg.selectAll('rect[type="cell"]')
            .transition()
            .duration(this.stepTime)
            .attr('fill', function (d) {
                return d == 1 ? '#000' : '#fff';
            });
    }

    function updateGrid() {
        var startTime = performance.now();
        var grid = this.torus.toArray();
        var gridItems = d3.merge(grid);

        var svg = d3.select('[role="fieldmap"]');
        svg.selectAll('rect[type="cell"]')
            .data(gridItems);
        colorizeGrid();

        // metrics
        var endTime = performance.now();
        $(document).trigger('updateGridFinished', [endTime - startTime]);
    }

} // end of life

function stepEvolution(currentTorus, scanCells) {
    var cellsSeen = 0;
    var startTime = performance.now();
    var cellsAlive = 0;
    var nextTorus = new TorusArray(currentTorus.rows, currentTorus.cols);

    var nextScanCells = [];

    function markForScan(i, j, neighbors) {
        var candidates = neighbors.map(function (n) {
            return currentTorus.absoluteIndex(n[0], n[1]);
        });
        candidates.push(currentTorus.absoluteIndex(i, j));
        for(var k = 0; k < candidates.length; k++) {
            if(nextScanCells.indexOf(candidates[k]) == -1) {
                nextScanCells.push(candidates[k]);
            }
        }
    }

    function checkCell(i, j) {
        var neighbors = currentTorus.neighbors(i, j);
        var neighborsState = neighbors.map(function (currValue) {
            return currentTorus.get(currValue[0], currValue[1]);
        });

        var population = neighborsState.reduce(function (prevValue, currValue) {
            return prevValue + currValue;
        });

        // new born
        if (currentTorus.get(i, j) == 0 && population == 3) {
            nextTorus.set(i, j, 1);
            markForScan(i, j, neighbors);
            cellsAlive++;
        }

        if (currentTorus.get(i, j) == 1) {
            // loneliness or overpopulation
            if (population < 2 || population > 3) {
                nextTorus.set(i, j, 0);
            }
            else {
                // lucky cell
                nextTorus.set(i, j, 1);
                markForScan(i, j, neighbors);
                cellsAlive++;
            }
        }
        cellsSeen++;
    }

    if(typeof scanCells == "undefined") {
        // scan whole field
        for (var i = 0; i < currentTorus.rows; i++) {
            for (var j = 0; j < currentTorus.cols; j++) {
                checkCell(i, j);
            }
        }
    }
    else {
        // scan only marked
        for(var k = 0; k < scanCells.length; k++) {
            var cell = currentTorus.arrayIndex(scanCells[k]);
            checkCell(cell[0], cell[1]);
        }
    }
    console.log("cells seen", cellsSeen, "cellsAlive", cellsAlive, "next round to see", nextScanCells.length);

    // metrics
    var endTime = performance.now();
    generation++;
    $(document).trigger('evolutionStepFinished', [
            endTime - startTime,
        generation,
        cellsAlive
    ]);

    return [nextTorus, nextScanCells];
}

// globals
TorusArray = modules.TorusArray;

var generation = 0,
    gameTimer = 0;

var lifeTorus = new TorusArray(rows, cols);
var scanCells = [];

initGrid(lifeTorus);
updateGrid(lifeTorus);


