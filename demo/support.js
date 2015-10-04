
(function (window) {
    "use strict";
    
    var $ = window.$,
        Geo = window.Geo,
        pos;
    
    function pointToString() {
        return this.x + "," + this.y;
    }
    
    function addToStringToPointList(arr) {
        
        var i;
        
        for (i = 0; i < arr.length; i++)
            arr[i].toString = pointToString;
        
    }
    
    function direction(polygon) {
        
        var start, end, middle,
            
            direction;
        
        direction = Geo.orientation(polygon[0], polygon[2], polygon[1]);
        
        for (start = 0; start < polygon.length; start++) {
            
            middle = (start + 1) % polygon.length;
            end = (start + 2) % polygon.length;
            
            if (direction !== Geo.orientation(polygon[start], polygon[end], polygon[middle])) {
                console.error("direction", start, direction,
                              Geo.orientation(polygon[start], polygon[end], polygon[middle]),
                              polygon[start].toString(), polygon[end].toString(), polygon[middle].toString());
                return -1;
            }
            
        }
        
        return direction;
        
    }
    
    function pointListToString(arr) {
        
        var i, s = arr[0].toString();
        
        for (i = 1; i < arr.length; i++)
            s += ", " + arr[i].toString();
        
        return s;
        
    }
    
    function polygonTrace(polygon) {
        var start = polygon[0],
            cur = polygon[0].lefts.get(polygon),
            priv, privPriv,
            list = [cur],
            str;
        
        if (typeof cur === "undefined")
            console.log(polygon[0], polygon);
        
        str = start.toString();
        while (cur !== start) {
            str += " -> " + cur.toString();
            
            if (typeof cur.lefts.get(polygon) === "undefined")
                console.log(cur, "POLYGON:", polygon);
            
            privPriv = priv;
            priv = cur;
            cur = cur.lefts.get(polygon);
            if (list.indexOf(cur) >= 0) {
                console.error("LOOPZL", str, cur);
                break;
            }
            list.push(cur);
            
        }
        
        str += " -> " + cur.toString();
        
        console.log("left: " + str);
        
        cur = polygon[0].rights.get(polygon);
        list = [cur];
        str = start.toString();
        while (cur !== start) {
            str += " -> " + cur.toString();
            cur = cur.rights.get(polygon);
            
            if (list.indexOf(cur) >= 0) {
                console.error("LOOPZR", str, cur);
                break;
            }
            list.push(cur);
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
    window.direction = direction;
    window.pointListToString = pointListToString;
    window.addToStringToPointList = addToStringToPointList;
    
}(window));
