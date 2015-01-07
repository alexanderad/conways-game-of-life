function RLE(content) {
    /*
    * Implements parser for Run Length Encoded format Life files (RLE) which
    are used for storing large Life patterns.
    RLE files are saved with a .rle file extension.
    
    Reference on file format can be found 
    on LifeWiki: http://conwaylife.com/wiki/Run_Length_Encoded
    This implementation is created keeping in mind life.js's needs and
    does not pretend to be most effective, most universal or else.
    */
    this.content = content;

    function readHeader(headerLine) {
        /*
        The first line is a header line, which has the form
        x = m, y = n
        where m and n are the width and height of the pattern, respectively. 
        */
        var match,
            re = /x = (\d+), y = (\d+)/;
        while ((match = re.exec(headerLine)) != null) {
            if (match.index === re.lastIndex) {
                re.lastIndex++;
            }
        };
        console.log(match);
    };
};