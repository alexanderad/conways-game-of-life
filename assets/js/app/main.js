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
    if (btn.hasClass("is-success")) {
      life.gameTimer = setInterval(function() {
        var markedCells = life.evolve();
        if (markedCells == 0) {
          $(btn).click();
        }
      }, life.stepTime);

      btn.removeClass("is-success").addClass("is-danger");
      btn_span.empty().append('<i class="fas fa-pause"></i>');
    } else {
      clearTimeout(life.gameTimer);

      btn.removeClass("is-danger").addClass("is-success");
      btn_span.empty().append('<i class="fas fa-play"></i>');
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
      var responseContainer = $("#id-list");

      if (response.success) {
        $("#id_search_count").text(response.count);
        responseContainer.empty();
        response.patterns.forEach(pattern => {
          responseContainer.append(
            `
            <div class="list-item">
            <div>
            <a href="#" class="rle-link" data-file="${pattern.fileName}">${
              pattern.name
            }</a>

          </div>
          <small>
            <b>${pattern.author || "Uknown author"}</b>
            ${
              typeof pattern.wiki !== "undefined"
                ? `&middot; <a target="_blank" href="${pattern.wiki}">wiki</a>`
                : ""
            }
          </small>
          <div>
              <small>${pattern.comments || ""}</small>
          </div>
          </div>
            `
          );
        });

        $("a.rle-link").on("click", function() {
          var fileName = $(this).attr("data-file");
          loadRLEFile(fileName);
        });
      }
    });
  }

  $(".search-field").on("keyup", function(e) {
    loadRLEList(e.currentTarget.value);
  });

  loadRLEList();
});
