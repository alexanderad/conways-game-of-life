(function(exports){

    var ParseError = function(msg) {
        var error = new Error();
        error.name = 'ParseError';
        error.message = msg || '';
        return error;
    };

    // polyfill: https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
    if (!String.prototype.startsWith) {
        Object.defineProperty(String.prototype, 'startsWith', {
            enumerable: false,
            configurable: false,
            writable: false,
            value: function (searchString, position) {
                position = position || 0;
                return this.lastIndexOf(searchString, position) === position;
            }
        });
    }

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
        this.pattern = {
            x: 0,
            y: 0,
            name: '',
            author: '',
            comments: []
        };
        var dataLines = content.split('\n');
        var cursor = 0;

        var commentTypes = {
            "C": function(line) {
                this.metaKey = "comment";
                return push, line.substr(3);
            },
            "N": function(line) {
                this.metaKey = "name";
                return line.substr(3);
            },
            "O": function(instance, line) {
                this.metaKey = "author";
                return line.substr(3);
            },
            "P": function(instance, line) {
                this.metaKey = "topLeftCoords";
                return line.substr(3);
            },
            "r": function(line) {
                this.metaKey = "rules";
                return line.substr(3);
            }
        };
        // synonyms
        commentTypes['c'] = commentTypes['C'];
        commentTypes['P'] = commentTypes['R'];

        function consumeLine() {
            if(typeof dataLines[cursor] == 'undefined') {
                throw ParseError("Unexpected end of file");
            }
            return dataLines[cursor++];
        }

        function getCommentLine(line) {
            for(var commentType in commentTypes) {
                if(commentTypes.hasOwnProperty(commentType)) {
                    if(line.startsWith("#" + commentType)) {
                        return commentType;
                    }
                }
            }
            return false;
        }

        function readComment(line) {

        }

        function readComments() {
            var metadata = {};
            while(true) {
                var line = consumeLine();
                var commentType = getCommentLine(line);
                if(!commentType) break;
                //var commentProcessor = commentTypes[commentType];
                //(line);
            }
            // step one line back
            cursor--;

        }

        function readHeader() {
            /*
            The first line is a header line, which has the form
            x = m, y = n
            where m and n are the width and height of the pattern, respectively.
            */
            var headerLine = consumeLine();
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

        var metadata = readComments();
        var size = readHeader();
        this.pattern.x = size[0];
        this.pattern.y = size[1];
    }

    RLEParser.prototype.errors = {
        100: 'Failed to parse header line'
    };

    exports.RLEParser = RLEParser;

})(typeof exports === 'undefined'? this['modules']={}: exports);
