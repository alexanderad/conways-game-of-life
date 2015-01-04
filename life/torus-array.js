(function(exports){
    
    Array.prototype.extendWith = function(extendWith, times) {
        var times = times || 1;
        for(var i = 0; i < times; i++) {
            this.push(extendWith);
        };
    };
    
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
            * setArray(newArray)
            * compress()
            * decompress(compressedTorusArray)

        
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

    TorusArray.prototype.setArray = function(arr) {
        if((arr.length != this.height) || (arr[0].length != this.width)) {
            console.log(
                "Input array does not correspondTorusArray width / height"
            );
        }
        else {
            this.grid = arr;
        }
    };

    TorusArray.prototype.toArray = function() {
        return this.grid;
    };

    TorusArray.prototype.compress = function() {
        function compressRow(row) {
            if(row.length == 0) {
                return row;
            }

            var compressedRow = [];
            var character = row[0],
                count = 1;
            for(var j = 1; j < row.length; j++) {
                if(row[j] != character) {
                    compressedRow.push(character, count);
                    character = row[j];
                    count = 1;
                }
                else {
                    count++;
                }
            }
            compressedRow.push(character, count);
            return compressedRow;
        };

        var originalSize = this.toArray().toString().length;
        var compressed = [];
        
        for(var i = 0; i < this.height; i++) {
            compressed.push(compressRow(this.grid[i]));
        };
        
        var compressedSize = compressed.toString().length;
        console.log("compression ratio:", 
                    (originalSize / compressedSize).toFixed(2))
        return compressed;
    };

    TorusArray.prototype.decompress = function(compressedArray) {
        function decompressRow(row) {
            if(row.length == 0) {
                return row;
            }

            var decompressedRow = [];
            for(var j = 0; j < row.length; j += 2) {
                var character = row[j],
                    count = row[j + 1];
                decompressedRow.extendWith(character, count);
            };
            return decompressedRow;
        };

        var decompressed = [];
        for(var i = 0; i < compressedArray.length; i++) {
            decompressed.push(decompressRow(compressedArray[i]));
        };
        return decompressed;
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

    exports.TorusArray = TorusArray;

})(typeof exports === 'undefined'? this['modules']={}: exports);
