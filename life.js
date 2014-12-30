var http = require('http');
var TorusArray = require('./torus-array.js');


http.createServer(function(request, response) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("hello");
    response.end();
}).listen(2100);
