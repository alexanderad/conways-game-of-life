#!/bin/bash
echo "Downloading patterns from LifeWiki..."
URL="http://www.conwaylife.com/patterns/all.zip"
OUTPUT_FILE="../patterns/all.zip"

WGET=`which wget`
CURL=`which curl`

if [ ! -z $WGET ]
then
    $WGET $URL -O $OUTPUT_FILE
else
    if [ ! -z $CURL ]
    then
        $CURL $URL -o $OUTPUT_FILE
    else
        echo "Error downloading patterns: both curl and wget are not available in the system."
    fi
fi

echo "Unpacking patterns..."
unzip $OUTPUT_FILE -d ../patterns/
find ../patterns/ -type f ! -name *.rle -delete

echo "Done."
