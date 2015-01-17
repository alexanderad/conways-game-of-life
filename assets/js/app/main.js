define(["app/life", "app/rle-parser", "bootstrap"], function(Life, RunLengthEncodedParser) {
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

    function loadRLEFile(fileName) {
        $.get('/rle/get/' + fileName, function(response) {
            if(response.success) {
                var fileData = response.fileData;
                var parsedData = RunLengthEncodedParser.parse(fileData);
                var lines = getRLEData(parsedData, "lines");
                var header = getRLEData(parsedData, "header");
                new life.torus.fromRLEData(header, lines);
            }
            else {
                console.log(response);
            }
        });
    }

    function getRLEData(parsedData, dataType) {
        for(var i = 0; i < parsedData.length; i++) {
            if(parsedData[i].type == dataType) {
                var data = parsedData[i];
                delete data["type"];
                return data;
            }
        }
    }

    function loadRLEFilesList() {
        $.get('/rle/list', function(response) {
            var responseContainer = $("#id_rle_panel_body");
            responseContainer.text('');
            if(response.success) {
                responseContainer.append('<ul>');
                for(var i = 0; i < response.files.length; i++) {
                    responseContainer.append([
                        '<li class="item-file">',
                            '<a href="#" data-file="' + response.files[i] + '">',
                                response.files[i],
                            '</a>',
                        '</li>'
                    ].join(''));
                }
                responseContainer.append('</ul>');
                $("li.item-file a").on('click', function () {
                    var fileName = $(this).attr('data-file');
                    loadRLEFile(fileName);
                });
            }
        });
    }

    loadRLEFilesList();
});
