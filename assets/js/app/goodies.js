define(function() {

    window.performance = (window.performance || {
        offset: Date.now(),
        now: function now() {
            return Date.now() - this.offset;
        }
    });

    window.width = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;

    window.height = window.innerHeight
        || document.documentElement.clientHeight
        || document.body.clientHeight;

    return;
});
