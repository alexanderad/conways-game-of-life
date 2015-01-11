#!/bin/sh
echo "Linking assets..."
ln -v life/goodies.js assets/js/goodies.js
ln -v life/life.js assets/js/life.js
ln -v life/torus-array.js assets/js/torus-array.js

echo "Compiling RLE parser..."
node node_modules/pegjs/bin/pegjs grammars/rle.pegjs assets/js/rle-parser.js
