define(["app/life", "bootstrap"], function(Life) {
    var life = new Life();

    $(life).on('evolutionStepFinished', {}, function (event, timeTaken, generation, cellsAlive) {
        $('#id_stats_step_evolution_ms').text(timeTaken.toFixed(0));
        $('#id_stats_generation').text(generation);
        $('#id_stats_cells_alive').text(cellsAlive);
    });

    $(life).on('updateGridFinished', {}, function (event, timeTaken) {
        $('#id_stats_render_grid_ms').text(timeTaken.toFixed(0));
    });

    $('#id_toggle_btn').click(function () {
        var btn = $('#id_toggle_btn');
        var btn_span = $('#id_toggle_btn > span');

        if (btn.hasClass('btn-success')) {
            life.gameTimer = setInterval(function () {
                var markedCells = life.evolve();
                if(markedCells == 0) {
                    $(btn).click();
                }
            }, life.stepTime);

            btn.removeClass('btn-success').addClass('btn-danger');
            btn_span.removeClass("glyphicon-play").addClass("glyphicon-pause");
        }
        else {
            clearTimeout(life.gameTimer);

            btn.removeClass('btn-danger').addClass('btn-success');
            btn_span.removeClass("glyphicon-pause").addClass("glyphicon-play");
        }
    });

});
