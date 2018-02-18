var express = require("express"),
  fs = require("fs"),
  path = require("path"),
  morgan = require("morgan");

var PATTERNS_DIR = path.join(__dirname, "patterns");

var app = express();

// logger
app.use(morgan("dev"));

// static files
app.use("/static", express.static(__dirname + "/assets"));

// routes
app.use("/favicon.ico", express.static(__dirname + "/assets/favicon.ico"));

app.get("/rle/list", function(req, res) {
  var q = req.query.q;
  fs.readdir(PATTERNS_DIR, function(err, files) {
    if (err) {
      res.json({
        success: false,
        error: err,
        msg: "error reading patterns directory"
      });
    }
    var filtered_files = files.filter(function(file) {
      var is_rle = file.search(".rle") >= 0;
      var is_match = true;
      if (typeof q !== "undefined" && q.length > 0) {
        is_match = file.search(q) >= 0;
      }
      return is_rle && is_match;
    });
    res.json({
      success: true,
      files: filtered_files,
      count: filtered_files.length
    });
  });
});

app.get("/rle/get/:filename", function(req, res) {
  var fileName = req.params.filename;
  var filePath = path.join(PATTERNS_DIR, fileName);
  fs.readFile(filePath, function(err, data) {
    if (err) {
      res.json({
        success: false,
        error: err,
        msg: "error reading file"
      });
    }
    res.json({
      success: true,
      fileData: data.toString()
    });
  });
});

app.get("/", function(req, res) {
  res.sendFile("views/index.html", { root: __dirname });
});

// server
var server = app.listen(3000, "localhost", function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Listening at %s:%s...", host, port);
});
