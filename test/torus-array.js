var assert = require('chai').assert,
    TorusArray = require('../life/torus-array.js').TorusArray;

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
});