(function(exports){
    
    function TorusArray(width, height, initValue) {
        /*
        Implements naive torus array.

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
        initValue = initValue || 0;
        
        function initGrid(width, height) {
            var grid = [];
            for(var i = 0; i < height; i++) {
                grid[i] = [];
                for(var j = 0; j < width; j++) {
                    grid[i][j] = initValue;
                };
            };
            return grid;
        };

        grid = initGrid(width, height);
    };

    TorusArray.prototype.normalizeIndex = function(i, j) {
        return [
            (this.height + i) % this.height, 
            (this.width + j) % this.width
        ];
    };

    TorusArray.prototype.print = function() {
        for(var i = 0; i < this.height; i++) {    
            console.log(grid[i]);
        };
    };

    TorusArray.prototype.get = function(i, j) {
        var index = this.normalizeIndex(i, j);
        return grid[index[0]][index[1]];
    };

    TorusArray.prototype.set = function(i, j, value) {
        var index = this.normalizeIndex(i, j);
        grid[index[0]][index[1]] = value;
    };

    TorusArray.prototype.toArray = function() {
        return grid;
    };

    module.exports = TorusArray;

})(typeof exports === 'undefined'? this['torus-array']={}: exports);
