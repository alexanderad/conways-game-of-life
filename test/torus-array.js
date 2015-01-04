var assert = require('chai').assert,
    TorusArray = require('../life/torus-array.js').TorusArray;

describe('TorusArray', function () {
    describe('public and private properties', function () {
        it('width and height are public', function () {
            var ta = new TorusArray(5, 10);
            assert.equal(ta.width, 5);
            assert.equal(ta.height, 10);
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
            var ta = new TorusArray(5, 4);
            ta.set(0, 0, 1);
            ta.set(0, 1, 1);
            ta.set(0, 3, 1);
            var compressed = ta.compress();

            assert.deepEqual(
                compressed,
                [
                    [1, 2, 0, 1, 1, 1, 0, 1],    
                    [0, 5],
                    [0, 5],
                    [0, 5],
                ]
            );
        });
        it('decompresses', function() {
            var compressed = [
                [1, 2, 0, 1, 1, 1, 0, 1],    
                [0, 5],
                [0, 5],
                [0, 5],
            ];

            

        });
    });
});