
(function (window) {
    "use strict";
    
    var $ = window.$,
        pos;
    
    function polygonTrace(polygon) {
        var start = polygon[0],
            cur = polygon[0].lefts.get(polygon),
            str;
        
        if (typeof cur === "undefined")
            console.log(polygon[0], polygon);
        
        str = start.toString();
        while (cur !== start) {
            str += " -> " + cur.toString();
            
            if (typeof cur.lefts.get(polygon) === "undefined")
                console.log(cur, "POLYGON:", polygon);
            
            cur = cur.lefts.get(polygon);
        }
        
        str += " -> " + cur.toString();
        
        console.log("left: " + str);
        
        cur = polygon[0].rights.get(polygon);
        str = start.toString();
        while (cur !== start) {
            str += " -> " + cur.toString();
            cur = cur.rights.get(polygon);
        }
        
        str += " -> " + cur.toString();
        
        console.log("right: " + str);
    }
    
    window.addEventListener("mousemove", function (e) {
        if (pos) pos.text("(" + e.clientX + ", " + e.clientY + ")");
    });
    
    document.addEventListener("DOMContentLoaded", function () {
        pos = $("#pos");
    });
    
    window.polygonTrace = polygonTrace;
    
}(window));
