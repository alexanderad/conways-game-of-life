// requirejs -> npm module compatibility shit
if (typeof define == "undefined") {
  define = function(func) {
    exports.TorusArray = func();
  };
}

define(function() {
  Array.prototype.extendWith = function(extendWith, times) {
    /*
         * Extends array with `extendWith` objects,
         optionally `times` times.
         */
    var times = times || 1;
    for (var i = 0; i < times; i++) {
      this.push(extendWith);
    }
  };

  Array.prototype.nRows = function() {
    return this.length;
  };

  Array.prototype.nCols = function() {
    return this[0].length;
  };

  Array.prototype.resize = function(rows, cols) {
    var extraColumns = Math.floor((cols - this.nCols()) / 2);
    this.forEach(row => {
      for (var i = 0; i < extraColumns; i++) {
        row.unshift(0);
        row.push(0);
      }
    });

    var extraRows = Math.floor((rows - this.nRows()) / 2);
    for (var i = 0; i < extraRows; i++) {
      var emptyRow = [];
      emptyRow.extendWith(0, this.nCols());
      this.unshift(emptyRow);
      this.push(emptyRow);
    }
  };

  Array.prototype.zfill2d = function(rows, cols, fillValue) {
    /*
     * Two-dimensional array zfill (extends array to `rows` rows
     * and `cols` columns, filling with zeros or provided `fillValue`)
     */
    var fillValue = fillValue || 0;

    if (this.length > rows || (this.length > 0 && this[0].length > cols)) {
      console.warn(
        "Given array",
        this,
        "is already larger than zfill requested",
        rows,
        "x",
        cols
      );
      return false;
    }
    for (var i = 0; i < this.length; i++) {
      if (this[i].length < cols) {
        this[i].extendWith(fillValue, cols - this[i].length);
      }
    }
    if (this.length < rows) {
      for (var i = 0; (i = rows - this.length); i++) {
        var zerosRow = [];
        zerosRow.extendWith(fillValue, cols);
        this.push(zerosRow);
      }
    }
  };

  Array.prototype.crop2d = function(row1, col1, row2, col2) {
    /*
     * Crop an area identified by (row1, col1), (row2, col2) region
     */
    var resultArray = [];
    var rows = this.slice(row1, row2 + 1);
    for (var i = 0; i < rows.length; i++) {
      resultArray.push(rows[i].slice(col1, col2 + 1));
    }
    return resultArray;
  };

  function TorusArray(rows, cols, initializer) {
    /*
    Implements naive torus array.

    You can pass initializer as a value or a function
    which accepts index in two-dimensional array (row, col)
    and should return a single value for that cell.

    Usage:
    new TorusArray(2, 2) -> [[0, 0], [0, 0]]
    new TorusArray(2, 2, 10) -> [[10, 10], [10, 10]]
    new TorusArray(2, 2, function(i, j) {
    return i * 10 + j;
    }) -> [[0, 1], [10, 11]]
    new TorusArray(2, 2, function(row, col) {
    return Math.round(Math.random());
    }) -> [[1, 0], [1, 1]]

    Instance has following methods:
    * get(row, col)
    * set(row, col, value)
    * normalizeIndex(row, col)
    * print()
    * toArray()
    * setArray(newArray)
    * compress()

    Class additionally provides:
    * decompress(compressedTorusArray)

    Functions get, set and normalizeIndex support both
    positive and negative indexing.
    */
    this.rows = rows;
    this.cols = cols;

    if (initializer === undefined) {
      // default initializer is zero for all cells
      initializer = function(row, col) {
        return 0;
      };
    } else {
      if (!(initializer instanceof Function)) {
        // if initializer is not a function, but value,
        // create a function to return that value
        var initValue = initializer;
        initializer = function(row, col) {
          return initValue;
        };
      }
    }

    function initGrid(rows, cols) {
      var initialGrid = [];
      for (var i = 0; i < rows; i++) {
        initialGrid[i] = [];
        for (var j = 0; j < cols; j++) {
          initialGrid[i][j] = initializer(i, j);
        }
      }
      return initialGrid;
    }

    this.grid = initGrid(rows, cols);
  }

  TorusArray.fromRLEData = function(header, lines) {
    // allow extra X columns and rows around boundaries of the pattern
    var globalOffset = 7;

    var torus,
      torusArray = [];

    var maxPatternCols = 0;
    for (var i = 0; i < lines.items.length; i++) {
      var row = [];
      var line = lines.items[i];
      for (var j = 0; j < line.length; j++) {
        var count = line[j][0];
        var value = line[j][1] == "o" ? 1 : 0;
        row.extendWith(value, count);
        maxPatternCols = Math.max(maxPatternCols, row.length);
      }
      torusArray.push(row);
    }
    var maxPatternRows = torusArray.length;

    // sometimes real pattern size is bigger than declared in header
    rows = Math.max(header.y, maxPatternRows);
    cols = Math.max(header.x, maxPatternCols);

    // extend with global offset
    torusArray.zfill2d(rows, cols);
    torusArray.resize(rows + globalOffset * 2, cols + globalOffset * 2);

    torus = new TorusArray(torusArray.nRows(), torusArray.nCols());
    torus.setArray(torusArray);
    return torus;
  };

  TorusArray.prototype.normalizeIndex = function(row, col) {
    return [(this.rows + row) % this.rows, (this.cols + col) % this.cols];
  };

  TorusArray.prototype.absoluteIndex = function(row, col) {
    var index = this.normalizeIndex(row, col);
    return index[0] * this.cols + index[1];
  };

  TorusArray.prototype.arrayIndex = function(absoluteIndex) {
    var col = absoluteIndex % this.cols;
    var row = (absoluteIndex - col) / this.cols;
    return [row, col];
  };

  TorusArray.prototype.print = function() {
    for (var i = 0; i < this.rows; i++) {
      console.log(this.grid[i]);
    }
  };

  TorusArray.prototype.get = function(row, col) {
    var index = this.normalizeIndex(row, col);
    return this.grid[index[0]][index[1]];
  };

  TorusArray.prototype.set = function(row, col, value) {
    var index = this.normalizeIndex(row, col);
    this.grid[index[0]][index[1]] = value;
  };

  TorusArray.prototype.setArray = function(arr) {
    if (arr.length != this.rows || arr[0].length != this.cols) {
      console.warn(
        "Input array does not correspond TorusArray cols / rows instance"
      );
    } else {
      this.grid = arr;
    }
  };

  TorusArray.prototype.toArray = function() {
    return this.grid;
  };

  TorusArray.prototype.compress = function() {
    function compressRow(row) {
      if (row.length == 0) {
        return row;
      }

      var compressedRow = [];
      var character = row[0],
        count = 1;
      for (var j = 1; j < row.length; j++) {
        if (row[j] != character) {
          compressedRow.push(character, count);
          character = row[j];
          count = 1;
        } else {
          count++;
        }
      }
      compressedRow.push(character, count);
      return compressedRow;
    }

    //var originalSize = this.toArray().toString().length;
    var compressed = [];

    for (var i = 0; i < this.rows; i++) {
      compressed.push(compressRow(this.grid[i]));
    }

    //var compressedSize = compressed.toString().length;
    return compressed;
  };

  TorusArray.decompress = function(compressedArray) {
    function decompressRow(row) {
      if (row.length == 0) {
        return row;
      }

      var decompressedRow = [];
      for (var j = 0; j < row.length; j += 2) {
        var character = row[j],
          count = row[j + 1];
        decompressedRow.extendWith(character, count);
      }
      return decompressedRow;
    }

    var decompressed = [];
    for (var i = 0; i < compressedArray.length; i++) {
      decompressed.push(decompressRow(compressedArray[i]));
    }
    return decompressed;
  };

  TorusArray.prototype.neighbors = function(row, col) {
    var index = this.normalizeIndex(row, col);
    var neighborsIndexes = [
      [-1, -1],
      [0, -1],
      [1, -1],
      [-1, 0],
      [1, 0],
      [-1, 1],
      [0, 1],
      [1, 1]
    ];
    var neighbors = [];
    for (var k = 0; k < neighborsIndexes.length; k++) {
      var neighborIndex = neighborsIndexes[k];
      neighbors.push(
        this.normalizeIndex(
          index[0] + neighborIndex[0],
          index[1] + neighborIndex[1]
        )
      );
    }
    return neighbors;
  };

  return TorusArray;
});
