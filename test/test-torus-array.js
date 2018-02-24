var assert = require('chai').assert,
    TorusArray = require('../assets/js/app/torus-array.js').TorusArray;

describe('TorusArray', function () {
    describe('public and private properties', function () {
        it('width and height are public', function () {
            var ta = new TorusArray(10, 5);
            assert.equal(ta.rows, 10);
            assert.equal(ta.cols, 5);
        });
    });

    describe('public methods', function () {
        it('simple set()', function() {
            var ta = new TorusArray(2, 2);
            ta.set(0, 0, 5);
            assert.equal(ta.get(0, 0), 5);
        });
        it('negative index set() + get()', function() {
            var ta = new TorusArray(3, 3);
            ta.set(-1, 0, 5);
            ta.set(0, -1, 7);

            assert.equal(ta.get(-1, 0), 5);
            assert.equal(ta.get(2, 0), 5);

            assert.equal(ta.get(0, -1), 7);
            assert.equal(ta.get(0, 2), 7);
        });
        it('positive out of bounds set() + get()', function() {
            var ta = new TorusArray(3, 3);
            ta.set(5, 0, 10);
            ta.set(0, 5, 7);

            assert.equal(ta.get(5, 0), 10);
            assert.equal(ta.get(2, 0), 10);

            assert.equal(ta.get(0, 5), 7);
            assert.equal(ta.get(0, 2), 7);
        });
        it('absoluteIndex#cols', function() {
            var ta = new TorusArray(3, 4);
            assert.equal(ta.absoluteIndex(0, 0), 0);

            assert.equal(ta.absoluteIndex(0, -1), 3);
            assert.equal(ta.absoluteIndex(0, 1), 1);
            assert.equal(ta.absoluteIndex(0, 2), 2);
            assert.equal(ta.absoluteIndex(0, 4), 0);
        });
        it('absoluteIndex#rows', function() {
            var ta = new TorusArray(3, 4);
            assert.equal(ta.absoluteIndex(1, 0), 4);
            assert.equal(ta.absoluteIndex(-1, 0), 8);
            assert.equal(ta.absoluteIndex(2, 3), 11);
        });
        it('arrayIndex', function() {
            var ta = new TorusArray(3, 4);
            assert.deepEqual(ta.arrayIndex(4), [1, 0]);
            assert.deepEqual(ta.arrayIndex(8), ta.normalizeIndex(-1, 0));
            assert.deepEqual(ta.arrayIndex(11), [2, 3]);

            assert.deepEqual(ta.arrayIndex(3), ta.normalizeIndex(0, -1));
            assert.deepEqual(ta.arrayIndex(1), [0, 1]);
            assert.deepEqual(ta.arrayIndex(2), [0, 2]);
            assert.deepEqual(ta.arrayIndex(0), ta.normalizeIndex(0, 4));
        });
    });

    describe('compressor', function() {
        it('compresses', function() {
            var ta = new TorusArray(4, 5);
            ta.set(0, 0, 1);
            ta.set(0, 1, 1);
            ta.set(0, 3, 1);
            var compressed = ta.compress();

            assert.deepEqual(
                compressed,
                [ [1, 2, 0, 1, 1, 1, 0, 1],
                  [0, 5],
                  [0, 5],
                  [0, 5] ]
            );
        });
        it('decompresses', function() {
            var compressed = [
                [1, 2, 0, 1, 1, 1, 0, 1],
                [0, 5],
                [0, 5],
                [0, 2, 1, 2, 0, 1],
            ];

            var decompressed = TorusArray.decompress(compressed);
            assert.deepEqual(
                decompressed,
                [ [1, 1, 0, 1, 0],
                  [0, 0, 0, 0, 0],
                  [0, 0, 0, 0, 0],
                  [0, 0, 1, 1, 0] ]
            )
        });
    });

    describe('zfill2d', function() {
        it('zfills2d empty array', function() {
            var array = [];
            array.zfill2d(2, 2);
            assert.deepEqual(
                array,
                [ [0, 0],
                  [0, 0] ]
            );
        });

        it('zfills2d with arbitrary value', function() {
            var array = [];
            array.zfill2d(2, 2, 'hello');
            assert.deepEqual(
                array,
                [ ['hello', 'hello'],
                  ['hello', 'hello'] ]
            );
        });

        it('zfills2d incomplete array', function() {
            var array = [
                [0],
                [1, 2]
            ];
            array.zfill2d(4, 3);
            assert.deepEqual(
                array,
                [ [0, 0, 0],
                  [1, 2, 0],
                  [0, 0, 0],
                  [0, 0, 0] ]
            );
        });
    });

    describe('crop2d', function() {
        var array = [
            [00, 01, 02, 03],
            [10, 11, 12, 13],
            [20, 21, 22, 23],
            [30, 31, 32, 33],
            [40, 41, 42, 43],
        ];
        it('crops2d simple', function() {
            var cropped = array.crop2d(0, 0, 1, 1);
            assert.deepEqual(
                cropped,
                [ [0, 1],
                  [10, 11] ]
            );
        });
        it('still crops2d :-)', function() {
            var cropped = array.crop2d(1, 1, 3, 2);
            assert.deepEqual(
                cropped,
                [ [11, 12],
                  [21, 22],
                  [31, 32] ]
            );
        });
    });

    describe('fromRLEData', function() {
        var header = {x: 10, y: 5};
        var lines = {
            items: [
                [
                    [5, 'b'],
                    [1, 'o'],
                    [2, 'b']
                ],
                [],
                [
                    [1, 'b'],
                    [2, 'o']
                ]
            ]
        };
        it('returns TorusArray', function() {
           var torus = TorusArray.fromRLEData(header, lines);
           assert.isObject(torus);
        });
        it('reads header correctly', function() {
            var torus = TorusArray.fromRLEData(header, lines);
            assert.equal(torus.rows, 5);
            assert.equal(torus.cols, 10);
        });
        it('reads lines correctly', function() {
            var torus = TorusArray.fromRLEData(header, lines);
            assert.deepEqual(
                torus.toArray(),
                [
                    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                ]
            );
        });
    });
});
