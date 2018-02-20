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

  function loadRLEList(q) {
    var url = "/rle/list";
    if (typeof q !== "undefined") {
      url = url + "?q=" + q;
    }
    $.get(url, function(response) {
      var responseContainer = $("#id_rle_panel_items");

      if (response.success) {
        $("#id_search_count").text(response.count);
        responseContainer.empty();
        response.patterns.forEach(pattern => {
          responseContainer.append([
            `
            <li class="list-group-item">
              <div>
                <a href="#" class="rle-link" data-file="${pattern.fileName}">${
              pattern.name
            }</a>
               &middot; ${pattern.author || "Uknown author"}</div>
               <div>
                  <small>${pattern.comments || ""}</small>
                  <small>
                    ${
                      typeof pattern.wiki !== "undefined"
                        ? `&middot; <a target="_blank" href="${
                            pattern.wiki
                          }">wiki</a>`
                        : ""
                    }
                  </small>
              </div>
            </li>
            `
          ]);
        });
        $("a.rle-link").on("click", function() {
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
    loadRLEList(e.currentTarget.value);
  });

  loadRLEList();
});
