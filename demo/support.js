
(function (window) {
    "use strict";

    let $ = window.$,
        geo = window.geo,
        earcut = window.earcut,
        Point = window.Point,
        drawing = window.drawing,
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

    window.drawExPolygon = function(exPolygon) {

        addToStringToPointList(exPolygon.outer);
        new drawing.Path(exPolygon.outer).fill("rgba(0,0,0,.5)").close().width(0).append().draw().temp();

        for (let i = 0; i < exPolygon.holes.length; i++) {

            addToStringToPointList(exPolygon.holes[i]);
            new drawing.Path(exPolygon.holes[i]).fill("rgba(255,255,255,.5)").close().width(0).append().draw().temp();

        }

    };

    window.tes = function(ex) {

        Point = window.Point;

        let parent = ex.outer, holes = ex.holes,

            list = [], indicies = [],

            trianglesRaw;

        //Push all parents onto the list first
        for (let i = 0; i < parent.length; i++) {
            list.push(parent[i].x);
            list.push(parent[i].y);
        }

        //Get the current index in list, push to holes, then push to list
        for (let i = 0; i < holes.length; i++) {
            indicies.push(list.length / 2);
            for (let n = 0; n < holes[i].length; n++) {
                list.push(holes[i][n].x);
                list.push(holes[i][n].y);
            }
        }

        //Get the raw triangles from ear cut
        trianglesRaw = earcut(list, indicies);

        for (let n = 0; n < trianglesRaw.length; n += 3)
            new drawing.Path([
                new Point(list[trianglesRaw[n] * 2], list[trianglesRaw[n] * 2 + 1]),
                new Point(list[trianglesRaw[n + 1] * 2], list[trianglesRaw[n + 1] * 2 + 1]),
                new Point(list[trianglesRaw[n + 2] * 2], list[trianglesRaw[n + 2] * 2 + 1])
            ]).close().width(0.1).append().draw().temp();

        /*eslint-disable no-console*/
        console.log(list, indicies, trianglesRaw);
        /*eslint-enable no-console*/

    };

    /*setTimeout(function() {

        Point = window.Point;

        let exPolygon = {
            outer: [
                new Point(10, 10),
                new Point(25, 10),
                new Point(25, 40),
                new Point(10, 40)
            ], holes: [
                [
                    new Point(15, 30),
                    new Point(20, 35),
                    new Point(10, 40)
                ],
                [
                    new Point(15, 15),
                    new Point(15, 20),
                    new Point(20, 15)
                ]
            ]
        };

        window.drawExPolygon(exPolygon);

        setTimeout(function() {

            drawing.clearTemp();
            window.tes(exPolygon);

        }, 1000);

    }, 1000);*/

}(window));
