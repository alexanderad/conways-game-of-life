#!/bin/sh
echo "Compiling RLE parser..."
node node_modules/pegjs/bin/pegjs -e RunLengthEncodedParser grammars/rle.pegjs assets/js/app/rle-parser.js