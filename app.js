var express = require("express"),
  fs = require("fs"),
  path = require("path"),
  morgan = require("morgan"),
  rle_parser = require("./assets/js/app/rle-parser");

var PATTERNS_DIR = path.join(__dirname, "patterns");
var patternsDatabase = [];
var app = express();

// logger
app.use(morgan("dev"));

// static files
app.use("/static", express.static(__dirname + "/assets"));

// routes
app.use("/favicon.ico", express.static(__dirname + "/assets/favicon.ico"));

app.get("/rle/list", function(req, res) {
  var q = req.query.q;
  var filtered_patterns = patternsDatabase.filter(function(pattern) {
    var is_match = true;
    if (typeof q !== "undefined" && q.length > 0) {
      is_match = pattern.name.toLowerCase().search(q.toLowerCase()) >= 0;
    }
    return is_match;
  });
  res.json({
    success: true,
    patterns: filtered_patterns,
    count: filtered_patterns.length
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

function loadRLEData(fileName, fileData) {
  try {
    var data = { fileName: fileName, comment: [], comments: "" };
    var parsedData = RunLengthEncodedParser.parse(fileData);
    parsedData.forEach(element => {
      if (element.type == "name" || element.type == "author") {
        data[element.type] = element.value.trim();
      }
      if (element.type == "comment") {
        data[element.type].push(element.value.trim());
      }
    });
    if (typeof data.name === "undefined") {
      data.name = "No name: " + data.fileName.trim();
    }

    data["comment"].forEach((comment, idx) => {
      if (comment.search("wiki") >= 0) {
        data["wiki"] = comment.trim();
        if (data["wiki"].search("http") == -1) {
          data["wiki"] = "http://" + data["wiki"];
        }
      } else {
        if (comment.search(".rle") >= 0) {
          return;
        } else {
          data["comments"] += comment;
        }
      }
    });

    delete data["comment"];

    return data;
  } catch (err) {
    console.warn("skipping pattern file", fileName, err.message);
    return null;
  }
}

// loading patterns database
function loadPatternsDatabase() {
  fs.readdir(PATTERNS_DIR, function(err, files) {
    if (err) {
      res.json({
        success: false,
        error: err,
        msg: "error reading patterns directory"
      });
    }
    files.forEach(fileName => {
      if (fileName.search(".rle") == -1) return;
      var filePath = path.join(PATTERNS_DIR, fileName);
      fs.readFile(filePath, function(err, data) {
        if (err) {
          console.log("Error reading file", filePath, err);
        }
        var pattern = loadRLEData(fileName, data.toString());
        if (pattern) patternsDatabase.push(pattern);
      });
    });
  });
}

loadPatternsDatabase();

// server
var server = app.listen(3000, "localhost", function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Listening at %s:%s...", host, port);
});
