requirejs.config({
    "baseUrl": "/static/js/lib",
    "paths": {
      "app": "../app",
      "d3": "d3.min",
      "jquery": "jquery.min",
      "bootstrap": "bootstrap.min"
    },
    "shim": {
        "bootstrap": {
            deps: ["jquery"]
        }
    }
});

requirejs(["app/main"]);
