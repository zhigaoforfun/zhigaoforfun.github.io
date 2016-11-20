define(['app'], function(services) {
    services.service('ScriptService',  ['$http','$q', function($http, $q){
    this.loadScript = function(path, tag, callback) {
        if (typeof(window[tag]) !== 'undefined')
        {
            callback("ok");
            return;
        }
        var done = false;
        var scr = document.createElement('script');

        scr.onload = handleLoad;
        scr.onreadystatechange = handleReadyStateChange;
        scr.onerror = handleError;
        scr.src = path;
        document.body.appendChild(scr);
        window[tag] = true;

        function handleLoad() {
            if (!done) {
                done = true;
                callback("ok");
            }
        }

        function handleReadyStateChange() {
            var state;

            if (!done) {
                state = scr.readyState;
                if (state === "complete") {
                    handleLoad();
                }
            }
        }
        function handleError() {
            if (!done) {
                done = true;
                callback("error");
            }
        }
    }
}]);
});

