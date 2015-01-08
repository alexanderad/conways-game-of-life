(function(exports){

    var ParseError = function(msg) {
        var error = new Error();
        error.name = 'ParseError';
        error.message = msg || '';
        return error;
    };

    function RLEParser(content) {
        /*
        * Implements parser for Run Length Encoded format Life files (RLE) which
        are used for storing large Life patterns.
        RLE files are saved with a .rle file extension.

        Reference on file format can be found
        on LifeWiki: http://conwaylife.com/wiki/Run_Length_Encoded
        This implementation is created keeping in mind life.js's needs and
        does not pretend to be most effective, most universal or else.
        */
        this.pattern = {};
        var dataLines = content.split('\n');
        
        function readHeader(headerLine) {
            /*
            The first line is a header line, which has the form
            x = m, y = n
            where m and n are the width and height of the pattern, respectively.
            */
            var re = /x = (\d+), y = (\d+)/g;
            var match = re.exec(headerLine);
            if(match == null) {
                throw ParseError("Can't parse pattern header line: " + headerLine);
            }

            var x = parseInt(match[1], 10),
                y = parseInt(match[2], 10);

            if(isNaN(x) || isNaN(y)) {
                throw ParseError("Can't parse pattern's width and height: " + headerLine);
            }

            return [x, y];
        }

        if(!dataLines.length) {
            throw ParseError("Empty file given")
        }

        var size = readHeader(dataLines[0]);
        this.pattern.x = size[0];
        this.pattern.y = size[1];
    }

    RLEParser.prototype.errors = {
        100: 'Failed to parse header line'
    };

    exports.RLEParser = RLEParser;

})(typeof exports === 'undefined'? this['modules']={}: exports);
