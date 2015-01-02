(function(exports){
    
    function TorusArray(width, height, initializer) {
        /*
        Implements naive torus array.

        You can pass initializer as a value or a function
        which accepts index in two-dimensional array (i, j)
        and should return a single value for that cell.

        Usage:
        new TorusArray(2, 2) -> [[0, 0], [0, 0]]
        new TorusArray(2, 2, 10) -> [[10, 10], [10, 10]]
        new TorusArray(2, 2, function(i, j) {
            return i * 10 + j;
        }) -> [[0, 1], [10, 11]]
        new TorusArray(2, 2, function(i, j) {
            return Math.round(Math.random());
        }) -> [[1, 0], [1, 1]]

        Instance has following functions:
            * get(row, column)
            * set(row, column, value)
            * normalizeIndex(row, column)
            * print()
            * toArray()
        
        Functions get, set and normalizeIndex support both 
        positive and negative indexing.
        */

        this.width = width;
        this.height = height;
        
        if(initializer === undefined) {
            // default initializer is zero for all cells
            initializer = function(i, j) { 
                return 0; 
            }
        }
        else {
            if(!(initializer instanceof Function)) {
                // if initializer is not a function, but value,
                // create a function to return that value
                var initValue = initializer;
                initializer = function(i, j) { 
                    return initValue;
                }
            }
        }
        
        function initGrid(width, height) {
            var initialGrid = [];
            for(var i = 0; i < height; i++) {
                initialGrid[i] = [];
                for(var j = 0; j < width; j++) {
                    initialGrid[i][j] = initializer(i, j);
                };
            };
            return initialGrid;
        };

        this.grid = initGrid(width, height);
    };

    TorusArray.prototype.normalizeIndex = function(i, j) {
        return [
            (this.height + i) % this.height, 
            (this.width + j) % this.width
        ];
    };

    TorusArray.prototype.print = function() {
        for(var i = 0; i < this.height; i++) {    
            console.log(this.grid[i]);
        };
    };

    TorusArray.prototype.get = function(i, j) {
        var index = this.normalizeIndex(i, j);
        return this.grid[index[0]][index[1]];
    };

    TorusArray.prototype.set = function(i, j, value) {
        var index = this.normalizeIndex(i, j);
        this.grid[index[0]][index[1]] = value;
    };

    TorusArray.prototype.neighbors = function(i, j) {
        var index = this.normalizeIndex(i, j);
        var neighborsIndexes = [
            [-1, -1], [0, -1], [1, -1],
            [-1, 0], [1, 0],
            [-1, 1], [0, 1], [1, 1]
        ];
        var neighbors = [];
        for(var k = 0; k < neighborsIndexes.length; k++) {
            var neighborIndex = neighborsIndexes[k];
            neighbors.push(
                this.normalizeIndex(
                    index[0] + neighborIndex[0],
                    index[1] + neighborIndex[1]
                )
            )
        }
        return neighbors;
    };

    TorusArray.prototype.toArray = function() {
        return this.grid;
    };

    exports.TorusArray = TorusArray;

})(typeof exports === 'undefined'? this['modules']={}: exports);
