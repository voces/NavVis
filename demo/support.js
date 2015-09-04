
(function (window) {
    "use strict";
    
    var $ = window.$,
        pos;
    
    function polygonTrace(polygon) {
        var start = polygon[0],
            cur = polygon[0].lefts.get(polygon),
            str;
        
        str = start.toString();
        while (cur !== start) {
            str += " -> " + cur.toString();
            cur = cur.lefts.get(polygon);
        }
        
        console.log("left: " + str);
        
        cur = polygon[0].rights.get(polygon);
        str = start.toString();
        while (cur !== start) {
            str += " -> " + cur.toString();
            cur = cur.rights.get(polygon);
        }
        
        console.log("right: " + str);
    }
    
    window.addEventListener("mousemove", function (e) {
        pos.text("(" + e.clientX + ", " + e.clientY + ")");
    });
    
    document.addEventListener("DOMContentLoaded", function () {
        pos = $("#pos");
    });
    
    window.polygonTrace = polygonTrace;
    
}(window));
