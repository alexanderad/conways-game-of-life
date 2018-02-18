define(["app/life", "bootstrap"], function(Life) {
  var life = new Life();
  bindEvents(life);

  function bindEvents(lifeInstance) {
    $(lifeInstance).on("evolutionStepFinished", {}, function(
      event,
      timeTaken,
      generation,
      cellsAlive
    ) {
      $("#id_stats_step_evolution_ms").text(timeTaken.toFixed(0));
      $("#id_stats_generation").text(generation);
      $("#id_stats_cells_alive").text(cellsAlive);
    });

    $(lifeInstance).on("updateGridFinished", {}, function(event, timeTaken) {
      $("#id_stats_render_grid_ms").text(timeTaken.toFixed(0));
    });
  }

  $("#id_toggle_btn").click(function() {
    var btn = $("#id_toggle_btn");
    var btn_span = $("#id_toggle_btn > span");
    if (btn.hasClass("btn-success")) {
      life.gameTimer = setInterval(function() {
        var markedCells = life.evolve();
        if (markedCells == 0) {
          $(btn).click();
        }
      }, life.stepTime);

      btn.removeClass("btn-success").addClass("btn-danger");
      btn_span.removeClass("glyphicon-play").addClass("glyphicon-pause");
    } else {
      clearTimeout(life.gameTimer);

      btn.removeClass("btn-danger").addClass("btn-success");
      btn_span.removeClass("glyphicon-pause").addClass("glyphicon-play");
    }
  });

  function loadRLEFile(fileName) {
    $.get("/rle/get/" + fileName, function(response) {
      if (response.success) {
        life = Life.fromRLEFile(response.fileData);
        bindEvents(life);
      } else {
        console.error(response);
      }
    });
  }

  function loadRLEFilesList(q) {
    var url = "/rle/list";
    if (typeof q !== "undefined") {
      url = url + "?q=" + q;
    }
    $.get(url, function(response) {
      var responseContainer = $("#id_rle_panel_items");

      if (response.success) {
        $("#id_search_count").text(response.count);
        responseContainer.text("");
        responseContainer.append("<ul>");
        for (var i = 0; i < response.files.length; i++) {
          responseContainer.append(
            [
              "<li>",
              '<a href="#" data-file="' + response.files[i] + '">',
              response.files[i],
              "</a>",
              "</li>"
            ].join("")
          );
        }
        responseContainer.append("</ul>");
        $("#id_rle_panel_items li > a").on("click", function() {
          var fileName = $(this).attr("data-file");
          loadRLEFile(fileName);
        });
      }
    });
  }

  $("label.tree-toggler").click(function() {
    $(this)
      .parent()
      .children("ul.tree")
      .toggle(300);
  });

  $(".search-field").on("keyup", function(e) {
    loadRLEFilesList(e.currentTarget.value);
  });

  loadRLEFilesList();
});
