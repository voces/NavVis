
(function (window) {
    "use strict";
    
    var $ = window.$,
        pos;
    
    window.addEventListener("mousemove", function (e) {
        pos.text("(" + e.clientX + ", " + e.clientY + ")");
    });
    
    document.addEventListener("DOMContentLoaded", function () {
        pos = $("#pos");
    });
    
}(window));
