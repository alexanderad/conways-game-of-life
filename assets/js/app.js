requirejs.config({
    "baseUrl": "/static/js/lib",
    "paths": {
      "app": "../app"
    }
});

requirejs(["app/main"]);
