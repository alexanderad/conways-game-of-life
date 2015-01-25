#!/bin/sh
echo "Compiling RLE parser..."
node node_modules/pegjs/bin/pegjs -e RunLengthEncodedParser grammars/rle.pegjs assets/js/app/rle-parser.js
echo "define(function() { return RunLengthEncodedParser; });" >> assets/js/app/rle-parser.js

pushd scripts
bash ./download-patterns.sh
popd
