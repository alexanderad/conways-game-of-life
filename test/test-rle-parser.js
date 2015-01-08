var assert = require('chai').assert,
    RLEParser = require('../life/rle-parser.js').RLEParser;

describe('RLEParser', function () {
    describe('parser', function () {
        it('header', function () {
            var pattern = [
                'x = 3, y = 4',
                'bo$2bo$3o!'
            ].join('\n');
            var parser = new RLEParser(pattern);
            assert.equal(parser.pattern.x, 3);
            assert.equal(parser.pattern.y, 4);
        });
        it('header with comments', function () {
            var pattern = [
                '#N Gosper glider gun',
                '#C This was the first gun discovered.',
                '#C As its name suggests, it was discovered by Bill Gosper.',
                'x = 3, y = 4',
                'bo$2bo$3o!'
            ].join('\n');
            var parser = new RLEParser(pattern);
            assert.equal(parser.pattern.x, 3);
            assert.equal(parser.pattern.y, 4);
        });
    });
});
