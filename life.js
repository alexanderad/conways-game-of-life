var express = require('express'),
    fs = require('fs'),
    morgan = require('morgan'),
    TorusArray = require('./life/torus-array.js');

var app = express();

// logger
app.use(morgan('dev'));

// static files
app.use('/static', express.static(__dirname + '/assets'));

// routes
app.get('/', function(req, res) {
    res.sendFile('views/index.html', {root: __dirname});
});

// server
var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Listening at %s:%s', host, port);
});