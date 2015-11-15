
(function (window) {
    "use strict";

    let $ = window.$,
        geo = window.geo,
        pos;

    function pointToString() {
        return this.x + "," + this.y;
    }

    function addToStringToPointList(arr) {

        for (let i = 0; i < arr.length; i++)
            arr[i].toString = pointToString;

    }

    function direction(polygon) {

        let dir = geo.orientation(polygon[0], polygon[2], polygon[1]);

        for (let start = 0, end, middle; start < polygon.length; start++) {

            middle = (start + 1) % polygon.length;
            end = (start + 2) % polygon.length;

            if (dir !== geo.orientation(polygon[start], polygon[end], polygon[middle])) {
                /*eslint-disable no-console*/
                console.error("direction", start, dir,
                              geo.orientation(polygon[start], polygon[end], polygon[middle]),
                              polygon[start].toString(), polygon[end].toString(), polygon[middle].toString());
                /*eslint-enable no-console*/
                return -1;
            }

        }

        return dir;

    }

    function pointListToString(arr) {

        let s = arr[0].toString();

        for (let i = 1; i < arr.length; i++)
            s += ", " + arr[i].toString();

        return s;

    }

    /*eslint-disable no-console*/
    function polygonTrace(polygon) {
        let start = polygon[0],
            cur = window.lPoint(polygon, polygon[0]),
            list = [cur],
            str;

        str = start.toString();
        while (cur !== start) {
            str += " -> " + cur.toString();
            cur = window.lPoint(polygon, cur);

            if (list.indexOf(cur) >= 0) break;

            list.push(cur);

        }

        str += " -> " + cur.toString();

        console.log("left: " + str);

        cur = window.rPoint(polygon, polygon[0]);
        list = [cur];
        str = start.toString();
        while (cur !== start) {
            str += " -> " + cur.toString();
            cur = window.rPoint(polygon, cur);

            if (list.indexOf(cur) >= 0) break;

            list.push(cur);
        }

        str += " -> " + cur.toString();

        console.log("right: " + str);

    }
    /*eslint-enable no-console*/

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

    window.jsonToJS = function(json) {
        json = json.replace(/(([^,]*,){15})/g, "$1\n");
        json = json.replace(/,([0-9])/g, ", $1");
        json = json.replace(/,\[/g, ", [");

        return json;
    };

}(window));
