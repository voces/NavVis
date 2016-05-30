//Midpoint in poly test is expensively redundent to keep doing >.<
(function (window) {
    "use strict";

    const LEFT = 1,
        RIGHT = 2;

    let ClipperLib = window.ClipperLib,
        Angle = window.Angle,
        util = window.util,

        cpr = new ClipperLib.Clipper(),
        co = new ClipperLib.ClipperOffset(2, 0.25),

        PI2 = Math.PI * 2;

    function distanceBetweenPoints(a, b) {
        let dx = b.x - a.x,
            dy = b.y - a.y;

        return Math.sqrt(dx * dx + dy * dy);
    }

    function angleBetweenPoints(a, b) {
        return Math.atan2(b.y - a.y, b.x - a.x);
    }

    function angleUnion(aLeft, aRight, bLeft, bRight) {

        if (aLeft <= -Math.PI) aLeft += PI2;
        if (aLeft > Math.PI) aLeft -= PI2;
        if (aRight < aLeft) aRight += PI2;
        if (aRight >= aLeft + Math.PI) aRight -= PI2;

        if (bLeft <= -Math.PI) bLeft += PI2;
        if (bLeft > Math.PI) bLeft -= PI2;
        if (bRight < bLeft) bRight += PI2;
        if (bRight >= bLeft + Math.PI) bRight -= PI2;

        if (aLeft > bLeft) {

            let temp = aLeft;
            aLeft = bLeft;
            bLeft = temp;

            temp = aRight;
            aRight = bRight;
            bRight = temp;

        }

        if (bLeft <= aRight) return new Angle(aLeft, Math.max(aRight, bRight));
        if (aLeft + PI2 <= bRight) return new Angle(bLeft, Math.max(aRight, bRight - PI2));

        return false;

    }

    //http://stackoverflow.com/a/13519549
    function angleIntersection(aLeft, aRight, bLeft, bRight) {

        //Normalize left to [0, 2*PI) and right to (left, left + 2*PI] (to allow for obtuse angles)

        while (aLeft < 0) aLeft += PI2;
        while (aLeft >= PI2) aLeft -= PI2;
        while (aRight <= aLeft) aRight += PI2;
        while (aRight > aLeft + PI2) aRight -= PI2;

        while (bLeft < 0) bLeft += PI2;
        while (bLeft >= PI2) bLeft -= PI2;
        while (bRight <= bLeft) bRight += PI2;
        while (bRight > bLeft + PI2) bRight -= PI2;

        //Angles are essentially normalized segments along a line; make sure a comes before b

        if (aLeft > bLeft) {

            let temp = aLeft;
            aLeft = bLeft;
            bLeft = temp;

            temp = aRight;
            aRight = bRight;
            bRight = temp;

        }

        // console.log(aLeft, aRight, bLeft, bRight);

        //The segments intersect, spit out that intersection
        if (bLeft <= aRight) return new Angle(bLeft, Math.min(aRight, bRight));

        //They don't, no intersection
        return false;

    }

    //True if n is between a or b inclusively
    function inclusiveBetween(n, a, b) {
        if (n < 0) n += PI2;
        if (a < 0) a += PI2;
        if (b < 0) b += PI2;

        //YAY FLOATING POINTZ
        if (Math.abs(a - n) < 1e-7) return true;
        if (Math.abs(b - n) < 1e-7) return true;

        if (a < b) return a <= n && n <= b;
        if (b < a) return a <= n || n <= b;
        return true;

    }

    function exclusiveBetween(n, a, b) {
        if (n < 0) n += PI2;
        if (a < 0) a += PI2;
        if (b < 0) b += PI2;

        //YAY FLOATING POINTZ
        if (Math.abs(a - n) < 1e-7) return false;
        if (Math.abs(b - n) < 1e-7) return false;

        if (a < b) return a < n && n < b;
        if (b < a) return a < n || n < b;
        return false;

    }

    //Simple box testing
    function boxIntersect(testMesh) {

        if (this.polygon.max.x < testMesh.min.x || this.polygon.min.x > testMesh.max.x ||
            this.polygon.max.y < testMesh.min.y || this.polygon.min.y > testMesh.max.y)
            return false;

        return true;

    }

    function pointInPolygon(point, polygon) {

        let inside = false,

            p, q, d,

            i;

        //Grab the first vertex
        p = polygon[0];

        //Loop through vertices
        for (i = 1; i <= polygon.length; i++) {

            //Grab the next vertex (to form a segment)
            q = i === polygon.length ? polygon[0] : polygon[i];

            //Test if the point matches either vertex
            if (q.y === point.y && (q.x === point.x || p.y === point.y && q.x > point.x === p.x < point.x))
                return false;

            //Only consider segments whose (vertical) interval the point fits in
            if (p.y < point.y !== q.y < point.y)

                //If one edge is to the right of us
                if (p.x >= point.x)

                    //And the other is as well (a wall)
                    if (q.x > point.x) inside = !inside;

                    else {
                        //Otherwise calculate if we fall to left or right
                        d = (p.x - point.x) * (q.y - point.y) - (q.x - point.x) * (p.y - point.y);

                        //We're on it (FLOAT POINT)
                        if (d >= -1e-7 && d <= 1e-7) return false;

                        //We fall to the left
                        else if (d > 0 === q.y > p.y) inside = !inside;
                    }

                else if (q.x > point.x) {
                    d = (p.x - point.x) * (q.y - point.y) - (q.x - point.x) * (p.y - point.y);

                    if (d >= -1e-7 && d <= 1e-7) return false;
                    else if (d > 0 === q.y > p.y) inside = !inside;
                }

            p = q;
        }

        return inside;

    }

    function pointInPolygons(point, polygons) {

        let i;

        for (i = 0; i < polygons.length; i++)
            if (pointInPolygon(point, polygons[i])) return polygons[i];

        return false;

    }

    function pointInPolygonsAll(point, polygons) {

        let foundPolygons = [],

            i;

        for (i = 0; i < polygons.length; i++)
            if (pointInPolygon(point, polygons[i])) foundPolygons.push(polygons[i]);

        if (foundPolygons.length)
            return foundPolygons;

        return false;

    }

    function orientation(start, end, c) {

        let val = (end.y - start.y) * (c.x - end.x) -
            (end.x - start.x) * (c.y - end.y);

        //Colinear (floating point...)
        //if (val === 0) return 0;
        //if (Math.abs(val) <= 1e-7) return 0;
        if (val >= -1e-7 && val <= 1e-7) return 0;

        //Clock or counterclock wise
        return val > 0 ? 1 : 2;
    }

    function linePolygonIntersect(start, end, polygon) {

        let max = {
                x: Math.max(start.x, end.x),
                y: Math.max(start.y, end.y)
            },
            min = {
                x: Math.min(start.x, end.x),
                y: Math.min(start.y, end.y)
            };

        for (let i = 0; i < polygon.length; i++) {
            let n = (i + 1) % polygon.length;

            //Box testing
            if (max.x < Math.min(polygon[i].x, polygon[n].x) || min.x > Math.max(polygon[i].x, polygon[n].x) ||
                max.y < Math.min(polygon[i].y, polygon[n].y) || min.y > Math.max(polygon[i].y, polygon[n].y))
                continue;

            let o1 = orientation(start, end, polygon[i]),
                o2 = orientation(start, end, polygon[n]),
                o3 = orientation(polygon[i], polygon[n], start),
                o4 = orientation(polygon[i], polygon[n], end);

            //Not the same; either they cross or bisect
            if (o1 !== o2 && o3 !== o4)

                //They cross
                if (o1 !== 0 && o2 !== 0 && o3 !== 0 && o4 !== 0 ||

                    //or bisect
                   o1 === 0 && o2 === o3 && o4 !== o2 && o4 !== 0 ||
                   o2 === 0 && o1 === o4 && o3 !== o1 && o3 !== 0)

                    return true;

        }

        // console.log("hmmm", {x: (start.x + end.x) / 2, y: (start.y + end.y) / 2}, polygon);

        return pointInPolygon({x: (start.x + end.x) / 2, y: (start.y + end.y) / 2}, polygon);

    }

    function linePolygonsIntersect(start, end, polygons) {

        let max = {
                x: Math.max(start.x, end.x),
                y: Math.max(start.y, end.y)
            },
            min = {
                x: Math.min(start.x, end.x),
                y: Math.min(start.y, end.y)
            },

            o1, o2, o3, o4,

            i, n, t;

        for (t = 0; t < polygons.length; t++) {

            //Box testing
            if (max.x < polygons[t].min.x || min.x > polygons[t].max.x ||
                max.y < polygons[t].min.y || min.y > polygons[t].max.y)
                continue;

            for (i = 0; i < polygons[t].length; i++) {

                n = (i + 1) % polygons[t].length;

                //Box testing
                if (max.x < Math.min(polygons[t][i].x, polygons[t][n].x) ||
                    min.x > Math.max(polygons[t][i].x, polygons[t][n].x) ||
                    max.y < Math.min(polygons[t][i].y, polygons[t][n].y) ||
                    min.y > Math.max(polygons[t][i].y, polygons[t][n].y))
                    continue;

                o1 = orientation(start, end, polygons[t][i]);
                o2 = orientation(start, end, polygons[t][n]);
                o3 = orientation(polygons[t][i], polygons[t][n], start);
                o4 = orientation(polygons[t][i], polygons[t][n], end);

                //Not the same; either they cross or bisect
                if (o1 !== o2 && o3 !== o4)

                    //They cross
                    if (o1 !== 0 && o2 !== 0 && o3 !== 0 && o4 !== 0 ||

                        //or bisect
                       o1 === 0 && o2 === o3 && o4 !== o2 && o4 !== 0 ||
                       o2 === 0 && o1 === o4 && o3 !== o1 && o3 !== 0) {

                        if (t !== 0) polygons.unshift(polygons.splice(t, 1)[0]);

                        return polygons[0];
                    }
            }

            //if (pointInPolygon({x: (start.x + end.x) / 2, y: (start.y + end.y) / 2}, polygons[t]))
                //return polygons[t];
        }

        return pointInPolygons({x: (start.x + end.x) / 2, y: (start.y + end.y) / 2}, polygons);

        //return false;
    }

    function lineLineIntersect(lineA, lineB) {

        let o1 = orientation(lineA[0], lineA[1], lineB[0]),
            o2 = orientation(lineA[0], lineA[1], lineB[1]),
            o3 = orientation(lineB[0], lineB[1], lineA[0]),
            o4 = orientation(lineB[0], lineB[1], lineA[1]);

        //Not the same; either they cross or bisect
        if (o1 !== o2 && o3 !== o4)

            //They cross
            if (o1 !== 0 && o2 !== 0 && o3 !== 0 && o4 !== 0)// ||

                    //or bisect
                    // o1 === 0 && o2 === o3 && o4 !== o2 && o4 !== 0 ||
                    // o2 === 0 && o1 === o4 && o3 !== o1 && o3 !== 0)

                return true;

        return false;

    }

    let checkNum = 0;

    function linePolygonsIntersect2(start, end, spatial, recent) {

        let max = {
                x: Math.max(start.x, end.x),
                y: Math.max(start.y, end.y)
            },
            min = {
                x: Math.min(start.x, end.x),
                y: Math.min(start.y, end.y)
            },

            query, polygons, polygon,

            linePolygonsIntersectCheck = checkNum++,

            o1, o2, o3, o4,

            i, n, t;

        //Test for recent array first (last n hit polygons)
        for (t = recent.length - 1; recent[t]; t++) {

            recent[t].linePolygonsIntersectCheck = linePolygonsIntersectCheck;

            //Box testing
            if (max.x < recent[t].min.x || min.x > recent[t].max.x ||
                max.y < recent[t].min.y || min.y > recent[t].max.y)
                continue;

            for (i = 0; i < recent[t].length; i++) {

                n = (i + 1) % recent[t].length;

                //Box testing
                if (max.x < Math.min(recent[t][i].x, recent[t][n].x) ||
                    min.x > Math.max(recent[t][i].x, recent[t][n].x) ||
                    max.y < Math.min(recent[t][i].y, recent[t][n].y) ||
                    min.y > Math.max(recent[t][i].y, recent[t][n].y))
                    continue;

                o1 = orientation(start, end, recent[t][i]);
                o2 = orientation(start, end, recent[t][n]);
                o3 = orientation(recent[t][i], recent[t][n], start);
                o4 = orientation(recent[t][i], recent[t][n], end);

                //Not the same; either they cross or bisect
                if (o1 !== o2 && o3 !== o4)

                    //They cross
                    if (o1 !== 0 && o2 !== 0 && o3 !== 0 && o4 !== 0 ||

                        //or bisect
                       o1 === 0 && o2 === o3 && o4 !== o2 && o4 !== 0 ||
                       o2 === 0 && o1 === o4 && o3 !== o1 && o3 !== 0) {

                        //Put to end of recent
                        if (t !== recent.length - 1) recent.push(recent.splice(t, 1)[0]);

                        return recent[recent.length - 1];
                    }
            }

        }

        query = spatial.queryLine(start.x, start.y, end.x, end.y);
        // let count = 0,
        //     doing = (start.x === 772 && start.y === 124 && end.x === 1148 && end.y === 260) ||
        //             (end.x === 772 && end.y === 124 && start.x === 1148 && start.y === 260);
        // if (doing) console.log(start, end);
        while ((polygons = query.next().value)) {
            // if (doing) console.log(count++, polygons);
            for (t = 0; t < polygons.length; t++) {

                //Don't check things multiple times
                /*if (polygons[t].linePolygonsIntersectCheck === linePolygonsIntersectCheck) continue;
                else polygons[t].linePolygonsIntersectCheck = linePolygonsIntersectCheck;*/

                //Box testing
                if (max.x < polygons[t].min.x || min.x > polygons[t].max.x ||
                    max.y < polygons[t].min.y || min.y > polygons[t].max.y)
                    continue;

                for (i = 0; i < polygons[t].length; i++) {

                    n = (i + 1) % polygons[t].length;

                    //Box testing
                    if (max.x < Math.min(polygons[t][i].x, polygons[t][n].x) ||
                        min.x > Math.max(polygons[t][i].x, polygons[t][n].x) ||
                        max.y < Math.min(polygons[t][i].y, polygons[t][n].y) ||
                        min.y > Math.max(polygons[t][i].y, polygons[t][n].y))
                        continue;

                    o1 = orientation(start, end, polygons[t][i]);
                    o2 = orientation(start, end, polygons[t][n]);
                    o3 = orientation(polygons[t][i], polygons[t][n], start);
                    o4 = orientation(polygons[t][i], polygons[t][n], end);

                    //Not the same; either they cross or bisect
                    if (o1 !== o2 && o3 !== o4)

                        //They cross
                        if (o1 !== 0 && o2 !== 0 && o3 !== 0 && o4 !== 0 ||

                            //or bisect
                           o1 === 0 && o2 === o3 && o4 !== o2 && o4 !== 0 ||
                           o2 === 0 && o1 === o4 && o3 !== o1 && o3 !== 0) {

                            //Bring to front of array
                            if (t !== 0) polygons.unshift(polygons.splice(t, 1)[0]);

                            //Bring to end of recent
                            recent.splice(0, 1);
                            recent.push(polygons[0]);

                            return polygons[0];

                        }
                }
            }

            if ((polygon = pointInPolygons({x: (start.x + end.x) / 2, y: (start.y + end.y) / 2}, polygons)))
                return polygon;

        }

        return false;
    }

    function linePolygonsIntersectAll(start, end, polygons) {

        let max = {
                x: Math.max(start.x, end.x),
                y: Math.max(start.y, end.y)
            },
            min = {
                x: Math.min(start.x, end.x),
                y: Math.min(start.y, end.y)
            },

            intersections = [],

            o1, o2, o3, o4,

            i, n, t;

        for (t = 0; t < polygons.length; t++) {

            //Box testing
            if (max.x < polygons[t].min.x || min.x > polygons[t].max.x ||
                max.y < polygons[t].min.y || min.y > polygons[t].max.y)
                continue;

            for (i = 0; i < polygons[t].length; i++) {
                n = (i + 1) % polygons[t].length;

                //Box testing
                if (max.x < Math.min(polygons[t][i].x, polygons[t][n].x) ||
                    min.x > Math.max(polygons[t][i].x, polygons[t][n].x) ||
                    max.y < Math.min(polygons[t][i].y, polygons[t][n].y) ||
                    min.y > Math.max(polygons[t][i].y, polygons[t][n].y))
                    continue;

                o1 = orientation(start, end, polygons[t][i]);
                o2 = orientation(start, end, polygons[t][n]);
                o3 = orientation(polygons[t][i], polygons[t][n], start);
                o4 = orientation(polygons[t][i], polygons[t][n], end);

                //Not the same; either they cross or bisect
                if (o1 !== o2 && o3 !== o4)

                    //They cross
                    if (o1 !== 0 && o2 !== 0 && o3 !== 0 && o4 !== 0 ||

                        //or bisect
                       o1 === 0 && o2 === o3 && o4 !== o2 && o4 !== 0 ||
                       o2 === 0 && o1 === o4 && o3 !== o1 && o3 !== 0) {

                        if (t !== 0) polygons.unshift(polygons.splice(t, 1)[0]);
                        intersections.push(polygons[0]);
                        i = polygons[t].length;
                    }
            }
        }

        if (intersections.length === 0)
            pointInPolygons({x: (start.x + end.x) / 2, y: (start.y + end.y) / 2}, polygons);

        else return intersections;

    }

    //function perpPoint(point, start, end) {
    function perpPoint(c, a, b) {

        let dx = b.x - a.x,
            dy = b.y - a.y,

            k = (dy * (c.x - a.x) - dx * (c.y - a.y)) / (dy * dy + dx * dx);

        return {
            x: c.x - k * dy,
            y: c.y + k * dx
        };
    }

    function dupFilter(item) {
        return this.indexOf(item) < 0;
    }

    function mergePolygons(polygons) {

        if (polygons.length === 1) return polygons[0];

        let combinedPolygon = new ClipperLib.Paths();

        /*eslint-disable new-cap*/
        co.Clear();
        co.AddPaths(polygons, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);
        co.Execute(combinedPolygon, 1);
        /*eslint-enable new-cap*/

        if (combinedPolygon.length === 1)
            return combinedPolygon[0];

        return combinedPolygon;
    }

    function growPolygon(polygon, polygons, alreadyIncluded) {

        let tPolygons,

            preLength,

            i, n;

        alreadyIncluded = alreadyIncluded || [polygon];
        preLength = alreadyIncluded.length;

        for (i = 0; i < polygon.length; i++) {
            n = (i + 1) % polygon.length;

            tPolygons = linePolygonsIntersectAll(polygon[i], polygon[n], polygons);

            if (tPolygons)
                alreadyIncluded = alreadyIncluded.concat(tPolygons.filter(dupFilter.bind(alreadyIncluded)));

        }

        tPolygons = mergePolygons(alreadyIncluded);
        if (typeof tPolygons[0].x === "undefined")
            tPolygons = tPolygons[0];

        if (alreadyIncluded.length > preLength)
            return growPolygon(tPolygons, polygons, alreadyIncluded);

        return polygon;

    }

    function growPolygons(growing, field, alreadyIncluded) {

        let i;

        if (typeof alreadyIncluded === "undefined") {
            alreadyIncluded = [];
            for (i = 0; i < growing.length; i++)
                alreadyIncluded.push(growing[i]);
        }

        for (i = 0; i < growing.length; i++)
            growing[i] = growPolygon(growing[i], field, alreadyIncluded);

        return mergePolygons(growing);

    }

    function nearestPoint(point, polygons, polygon) {

        let nearPoint = null,
            nearDistance = Number.POSITIVE_INFINITY,

            distance, tPoint, tPolygon, combinedPolygon,

            i, n;

        if (typeof polygon === "undefined") {
            polygon = pointInPolygonsAll(point, polygons);
            if (!polygon) return point;

            polygon = mergePolygons(polygon);
            if (typeof polygon[0].x === "undefined")
                polygon = polygon[0];
            // console.log("merged", polygon);
        }
        // console.log("passed", polygon);

        // if (typeof polygon.x === "number") console.error("invalid polygon!");

        for (i = 0; i < polygon.length; i++) {
            n = (i + 1) % polygon.length;

            tPoint = perpPoint(point, polygon[i], polygon[n]);

            distance = distanceBetweenPoints(point, tPoint);
            if (distance < nearDistance && !pointInPolygon(tPoint, polygon)) {
                nearDistance = distance;
                nearPoint = tPoint;
            }

            distance = distanceBetweenPoints(point, polygon[i]);
            if (distance < nearDistance) {
                nearDistance = distance;
                nearPoint = polygon[i];
            }

        }
        // console.log(nearPoint);
        tPolygon = pointInPolygonsAll(nearPoint, polygons);
        if (tPolygon) {

            combinedPolygon = new ClipperLib.Paths();

            /*eslint-disable new-cap*/
            co.Clear();
            co.AddPaths(tPolygon, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);
            co.Execute(combinedPolygon, 1);

            cpr.Clear();
            cpr.AddPaths([polygon, combinedPolygon[0]], ClipperLib.PolyType.ptClip, true);
            cpr.Execute(ClipperLib.ClipType.ctUnion, combinedPolygon,
                        ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
            /*eslint-enable new-cap*/

            if (typeof combinedPolygon[0].x === "undefined")
                combinedPolygon = combinedPolygon[0];

            return nearestPoint(point, polygons, combinedPolygon);
        }

        return nearPoint;

    }

    //true is left, false is right
    function goingLeft(start, end, length) {

        if (start < end) {

            if (start === 0 && end === length - 1)
                return true;

            return false;
        }

        if (end === 0 && start === length - 1)
            return false;

        return true;

    }

    function binarySearch(arr, accessor, key, min, max) {

        if (min < max) return null;

        let mid = Math.floor((min + max) / 2),
            value = accessor(arr, mid);

        if (value > key) return binarySearch(arr, accessor, key, min, mid - 1);
        if (value < key) return binarySearch(arr, accessor, key, mid + 1, max);
        return mid;

    }

    //Generates all bridges, seeds the shortest bridge as a set, and keeps adding the shortest remaining bridge to all sets
    function getKNearestPointsOfPolygons(polygonA, polygonB, k) {

        if (k > polygonA.length || k > polygonB.length)
            throw Error("k cannot be bigger than the size of polygonA or polygonB");

        let bridges = [];

        //Generate all possible bridges
        for (let i = 0; i < polygonA.length; i++)
            for (let n = 0; n < polygonB.length; n++)
                bridges.push([i, n, distanceBetweenPoints(polygonA[i], polygonB[n])]);

        bridges.sort((a, b) => b[2] - a[2]);

        //Should convert this to use a minheap...

        let sets = [[bridges.pop()]];
        sets[0].sum = sets[0][0][2];

        while (sets[0].length < k && bridges.length) {

            let bridge = bridges.pop(),
                setLength = sets.length,
                singular = true;

            // console.log("trying", bridge);

            for (let i = 0; i < setLength; i++) {

                let flag = false;
                for (let n = 0; n < sets[i].length; n++)

                    // console.log("test", sets[i][n], bridge, lineLineIntersect([polygonA[sets[i][n][0]], polygonB[sets[i][n][1]]], [polygonA[bridge[0]], polygonB[bridge[1]]]));

                    //Do not allow bridges tos hare points or cross
                    if (sets[i][n][0] === bridge[0] || sets[i][n][1] === bridge[1] ||
                        lineLineIntersect([polygonA[sets[i][n][0]], polygonB[sets[i][n][1]]], [polygonA[bridge[0]], polygonB[bridge[1]]])) {
                        flag = n;
                        break;
                    }

                if (flag === false) {
                    sets[i].push(bridge);
                    sets[i].sum += bridge[2];

                } else if (sets[i].length > 1 || singular) {
                    let newSet = [...sets[i].slice(0, flag), ...sets[i].slice(flag + 1), bridge];
                    newSet.sum = sets[i].sum - sets[i][flag][2] + bridge[2];
                    sets.push(newSet);
                    singular = false;
                }

            }

            sets.sort((a, b) => a.length === b.length ? a.sum - b.sum : b.length - a.length);

            // for (let i = 0; i < sets.length; i++)
            //     console.log(i, sets[i].length, sets[i].sum, sets[i].slice(0));
            //
            // console.log("");

        }

        return sets[0];
    }

    function merge(polygons) {

        let pool = polygons.slice(1),
            merged = polygons[0].slice(0),

            exit = 10;

        while (pool.length && exit-- > 0) {

            console.log("pool", pool);

            let candidate;
            for (let i = 0; i < pool.length; i++) {

                candidate = pool[i];

                let success = false,
                    n, t;

                outer: for (n = 0; n < merged.length; n++)
                    for (t = 0; t < candidate.length; t++)

                        // console.log(merged[n].toString(), candidate[t].toString(), merged[(n+1)%merged.length].toString(), candidate[t?t-1:candidate.length-1].toString());
                        // console.log(merged[n] === candidate[t], merged[(n+1)%merged.length] === candidate[t?t-1:candidate.length-1]);

                        if (merged[n] === candidate[t] && merged[(n+1)%merged.length] === candidate[t?t-1:candidate.length-1]) {
                            success = true;
                            break outer;
                        }

                if (success) {

                    console.log("success", util.arrayToProp(merged, "id"), util.arrayToProp(candidate, "id"), n, t);

                    // util.swapLoopArrReverse(candidate);

                    // t = candidate.length - 1 - t;

                    console.log(util.arrayToProp(merged.slice(0, n + 1), "id"));
                    console.log(util.arrayToProp(candidate.slice(t + 1, candidate.length), "id"));
                    console.log(util.arrayToProp(candidate.slice(0, t - 1), "id"));
                    console.log(util.arrayToProp(merged.slice(n + 1), "id"));

                    merged.splice(n + 1, 0, ...candidate.slice(t + 1, candidate.length), ...candidate.slice(0, t - 1));

                    pool.splice(i, 1);

                    break;

                }

            }

        }

        return merged;

    }

    //Breaks a polygon with a hole into two polygons
    function bridgeHole(outer, inner) {

        inner = util.swapLoopArrReverse(inner.slice(0));

        let bridges = getKNearestPointsOfPolygons(outer, inner, 2);

        // console.log(bridges);
        // console.log(outer[bridges[0][0]] + " " + inner[bridges[0][1]], "---", outer[bridges[1][0]] + " " + inner[bridges[1][1]]);
        // console.log(bridges[0][0] + " " + bridges[0][1], "---", bridges[1][0] + " " + bridges[1][1]);

        console.log(util.arrayToProp(outer, "id", " "), "---", util.arrayToProp(inner, "id", " "));

        // console.log(util.arrayToString(outer, " "), "---", util.arrayToString(inner, " "));

        //Simplify the cases from 4 to 2; first new polygon will always contain outer's 0 point
        if (bridges[1][0] < bridges[0][0]) {
            let swap = bridges[0];
            bridges[0] = bridges[1];
            bridges[1] = swap;
        }

        console.log(bridges[0][0] + " " + bridges[0][1], "---", bridges[1][0] + " " + bridges[1][1]);

        console.log(bridges[0][1] < bridges[1][1]);

        if (bridges[0][1] < bridges[1][1]) {

            console.log("-----", "Indices", "-----");

            console.log(0, bridges[0][0] + 1);
            console.log(bridges[0][1], bridges[1][1] + 1);
            console.log(bridges[1][0], outer.length);

            console.log("-----", "Parts", "-----");

            console.log(...outer.slice(0, bridges[0][0] + 1));
            console.log(...inner.slice(bridges[0][1], bridges[1][1] + 1));
            console.log(...outer.slice(bridges[1][0], outer.length));

        } else {

            console.log("-----", "Indices", "-----");

            console.log(0, bridges[0][0] + 1);
            console.log(bridges[0][1], inner.length);
            console.log(0, bridges[1][1] + 1);
            console.log(bridges[1][0], outer.length);

            console.log("-----", "Parts", "-----");

            console.log(...outer.slice(0, bridges[0][0] + 1));
            console.log(...inner.slice(bridges[0][1], inner.length));
            console.log(...inner.slice(0, bridges[1][1] + 1));
            console.log(...outer.slice(bridges[1][0], outer.length));

        }

        //First bridge sees its index on the inner first; the zero element of the inner is not included
        if (bridges[0][1] < bridges[1][1])

            return [[
                ...outer.slice(0, bridges[0][0] + 1),
                ...inner.slice(bridges[0][1], bridges[1][1] + 1),
                ...outer.slice(bridges[1][0], outer.length)
            ], [
                ...outer.slice(bridges[0][0], bridges[1][0] + 1),
                ...inner.slice(bridges[1][1], inner.length),
                ...inner.slice(0, bridges[0][1] + 1)
            ]];

        //First bridge sees its index on the inner second; the zero element of the inner is included
        return [[
            ...outer.slice(0, bridges[0][0] + 1),
            ...inner.slice(bridges[0][1], inner.length),
            ...inner.slice(0, bridges[1][1] + 1),
            ...outer.slice(bridges[1][0], outer.length),
        ], [
            ...outer.slice(bridges[0][0], bridges[1][0] + 1),
            ...inner.slice(bridges[1][1], bridges[0][1] + 1),
        ]];

    }

    function stringifyArrayContents(arr) {

        let s = [];

        for (let i = 0; i < arr.length; i++)
            s.push(arr[i].id);
            // s.push(arr[i].toString());

        return s;

    }

    function arrayFromArrayIndicies(array, indicies) {

        let arr = [];

        for (let i = 0; i < indicies.length; i++)
            arr.push(array[indicies[i]]);

        return arr;

    }

    function polarProjection(point, angle, distance) {

        return {x: point.x + Math.cos(angle) * distance, y: point.y + Math.sin(angle) * distance};

    }

    function crossTest(prev, start, end, test, back1, back2) {

        // let angle = angleBetweenPoints(end, start),
        //     project = polarProjection(end, angle + Math.PI / 2, 10);

        // return orientation(end, project, test);

        // console.log(prev, back2, test);

        if (!prev) return false;

        return end === back1 && orientation(back2, test, end) !== 1 && orientation(prev, back2, test) !== 2;

        // console.log("crossTest", start.id, end.id, end.toString(), `${project.x},${project.y}`, orientation(end, project, test));

    }

    //[{"x":199,"y":259},{"x":273,"y":663},{"x":1045,"y":337},{"x":572,"y":99},{"x":577,"y":292}]
    //[{"x":257,"y":194},{"x":275,"y":552},{"x":312,"y":255},{"x":363,"y":611},{"x":389,"y":253},{"x":459,"y":559},{"x":466,"y":190}]
    //[{"x":492,"y":154},{"x":227,"y":179},{"x":1160,"y":662}]
    //[{"x":543,"y":100},{"x":287,"y":361},{"x":566,"y":689},{"x":223,"y":501},{"x":156,"y":754},{"x":933,"y":838},{"x":1031,"y":154},{"x":909,"y":215},{"x":766,"y":25}]
    //[{"x":1099,"y":103},{"x":968,"y":248},{"x":1155,"y":59},{"x":1038,"y":323},{"x":84,"y":678},{"x":110,"y":404},{"x":182,"y":466},{"x":250,"y":533}]
    function newMosaic(polygon) {

        console.log("mosaic", `(${polygon.map(p => p.id).join(" ")})`, `(${polygon.map(p => p.toString()).join(" ")})`);

        let lines = [], strut = [], line = [];

        if (orientation(polygon[polygon.length - 1], polygon[0], polygon[1]) !== RIGHT)
            line.push(polygon[0]);
        else {
            lines.push(line);
            line = [polygon[0]];
        }

        for (let i = 0; i < polygon.length - 2; i++)
            if (orientation(polygon[i], polygon[i + 1], polygon[i + 2]) !== RIGHT)
                line.push(polygon[i + 1]);
            else {
                if (line.length) lines.push(line);
                line = [polygon[i + 1]];
            }

        console.log(...lines.map(line => `(${line.map(p => p.id).join(",")})`), `temp (${line.map(p => p.id).join(",")})`);

        // lines[0] = lines[0].concat(line);

        if (orientation(polygon[polygon.length - 2], polygon[polygon.length - 1], polygon[0]) !== RIGHT)
            line.push(polygon[polygon.length - 1]);
        else {
            lines.push(line);
            line = [polygon[polygon.length - 1]];
        }

        console.log(...lines.map(line => `(${line.map(p => p.id).join(",")})`), `temp (${line.map(p => p.id).join(",")})`);

        if (lines[0].length > 1)
            console.log(lines[0].length, orientation(line[line.length - 1], lines[0][0], lines[0][1]));

        if (lines[0])
            if (lines[0].length > 1)
                if (orientation(lines[0][lines[0].length - 1], line[0], line[1]) !== RIGHT)
                    lines[0] = line.concat(lines[0]);
                else lines.push(line);
            else if (orientation(line[line.length - 1], lines[0][0], line[0]) !== RIGHT)
                lines[0] = line.concat(lines[0]);
            else lines.push(line);
        else lines.push(line);

        console.log(...lines.map(line => `(${line.map(p => p.id).join(",")})`));

        for (let i = 0; i < lines.length; i++) {

            let n = 0;
            while (lines[i].length >= 2 && orientation(lines[i][lines[i].length - n - 1], lines[i][0], lines[i][1]) === RIGHT)
                n++;

            if (n > 0) {

                // line = [lines[i][lines[i].length - n - 1], ...lines[i].splice(lines[i].length - n), lines[i][0]];
                line = lines[i].splice(lines[i].length - n);
                console.log("killed", `(${line.map(p => p.id).join(",")})`);
                lines.push(line);

            }

        }

        console.log(...lines.map(line => `(${line.map(p => p.id).join(",")})`));

        for (let i = 0; i < lines.length - 1; i++)
            if (lines[i + 1].length > 1) {
                if (orientation(lines[i][lines[i].length - 1], lines[i + 1][0], lines[i + 1][1]) !== RIGHT) {
                    console.log("join", i, i + 1);
                    lines[i + 1] = lines[i].concat(lines[i + 1]);
                    lines.splice(i, 1);
                    i--;
                }
                // else lines.push(line);
            } else if (orientation(lines[i][lines[i].length - 1], lines[i + 1][0], lines[i][0]) !== RIGHT && orientation(lines[i + 1][0], lines[i][0], lines[i][1]) !== RIGHT) {
                console.log("joinb", i, i + 1);
                lines[i + 1] = lines[i].concat(lines[i + 1]);
                lines.splice(i, 1);
                i--;
            }

        console.log(...lines.map(line => `(${line.map(p => p.id).join(",")})`));

        for (let i = 0; i < lines.length - 1; i++)
            if (lines[i + 1].length > 1) {
                if (orientation(lines[i][lines[i].length - 1], lines[i + 1][0], lines[i + 1][1]) !== RIGHT) {
                    console.log("join", i, i + 1);
                    lines[i + 1] = lines[i].concat(lines[i + 1]);
                    lines.splice(i, 1);
                    i--;
                }
                // else lines.push(line);
            } else if (orientation(lines[i][lines[i].length - 1], lines[i + 1][0], lines[i][0]) !== RIGHT && orientation(lines[i + 1][0], lines[i][0], lines[i][1]) !== RIGHT) {
                console.log("joinb", i, i + 1);
                lines[i + 1] = lines[i].concat(lines[i + 1]);
                lines.splice(i, 1);
                i--;
            }

        // if (lines[0].length > 1)
        //     if (orientation(lines[lines.length - 1][lines[lines.length - 1].length - 1], lines[0][0], lines[0][1])) {
        //         lines[0] = lines[lines.length - 1].concat(lines[0]);
        //         lines.pop();
        //     }
        //     // else lines.push(line);
        // else if (orientation(line[lines[lines.length - 1].length - 1], lines[0][0], line[0])) {
        //     lines[0] = lines[lines.length - 1].concat(lines[0]);
        //     lines.pop();
        // }
                // else lines.push(line);
            // else lines.push(line);

        console.log(...lines.map(line => `(${line.map(p => p.id).join(",")})`));

    }

    function check(polygon, indices, test) {

        // for (let i = 0; i < )

        for (let i = indices.length - 2; i >= 0; i--)
            if (orientation(polygon[indices[i]], polygon[indices[i + 1]], polygon[test]) === RIGHT)
                return false;

        return true;

        // for (let i = checks.length - 1; i >= 0; i--)
        //     if (orientation(polygon[checks[i][0]], polygon[checks[i][1]], polygon[test]) === RIGHT) {
        //         console.log("fail", `${polygon[checks[i][0]].id}->${polygon[checks[i][1]].id}`);
        //         return false;
        //     }
        //
        // return true;

    }

    function rCheck(polygon, indices, test) {

        console.log("rCheck1", polygon[test].id, polygon[indices[0]].id, polygon[indices[1]].id);

        if (orientation(polygon[test], polygon[indices[0]], polygon[indices[1]]) === LEFT)
            return false;

        let i = indices.length;
        while (orientation(polygon[indices[i - 2]], polygon[0], polygon[indices[i - 1]]) === RIGHT)
            i--;

        console.log("rCheck", indices.length - i);

    }

    //[{"x":199,"y":259},{"x":273,"y":663},{"x":1045,"y":337},{"x":572,"y":99},{"x":577,"y":292}]
    //[{"x":257,"y":194},{"x":275,"y":552},{"x":312,"y":255},{"x":363,"y":611},{"x":389,"y":253},{"x":459,"y":559},{"x":466,"y":190}]
    //[{"x":492,"y":154},{"x":227,"y":179},{"x":1160,"y":662}]
    //[{"x":543,"y":100},{"x":287,"y":361},{"x":566,"y":689},{"x":223,"y":501},{"x":156,"y":754},{"x":933,"y":838},{"x":1031,"y":154},{"x":909,"y":215},{"x":766,"y":25}]
    //[{"x":1099,"y":103},{"x":968,"y":248},{"x":1155,"y":59},{"x":1038,"y":323},{"x":84,"y":678},{"x":110,"y":404},{"x":182,"y":466},{"x":250,"y":533}]
    function mosaic(polygon, recursionLevel) {

        if (typeof recursionLevel === "undefined") recursionLevel = 0;
        else if (recursionLevel > 10) return [];

        // if (polygon.length <= 3) return [polygon];

        // console.log("mosaic", recursionLevel, stringifyArrayContents(polygon).join(" "));
        console.log(" ");
        console.log("mosaic", recursionLevel, `(${polygon.map(p => p.id).join(" ")})`, `(${polygon.map(p => p.toString()).join(" ")})`);

        let polygonIndices = [0, 1],
            pocketIndices = [],
            checks = [[0, 1]],
            prevPop = false, prevPrevPop = false;

        if (orientation(polygon[polygon.length - 1], polygon[0], polygon[1]) === 2) {

            let i = 0;
            while (orientation(polygon[i], polygon[i + 1], polygon[i + 2]) === 2)
                i++;

            polygon = [...polygon.slice(i + 1), ...polygon.slice(0, i + 1)];

            console.log("shift", i + 1, `(${polygon.map(p => p.id).join(" ")})`);
            // console.log("shift", i + 1, stringifyArrayContents(polygon).join(" "));
        }

        for (let i = 2; i < polygon.length; i++) {

            console.log("checks", checks.map(check => `${polygon[check[0]].id}->${polygon[check[1]].id}`).join(" "));
            console.log("test", `(${polygonIndices.map(i => polygon[i].id).join(" ")})`, polygon[i].id, check(polygon, polygonIndices, i), rCheck(polygon, polygonIndices, i));
                // orientation(polygon[polygonIndices[polygonIndices.length - 2]], polygon[polygonIndices[polygonIndices.length - 1]], polygon[i]),
                // orientation(polygon[i], polygon[polygonIndices[0]], polygon[polygonIndices[1]]),
                // orientation(polygon[polygonIndices[0]], polygon[polygonIndices[1]], polygon[i]));

            // console.log("masterCheck", check(polygon, checks, i));

            // if (polygonIndices.length >= 3)
            //     console.log("test2", polygon[i - 1] === polygon[polygonIndices[polygonIndices.length - 1]], polygon[polygonIndices[polygonIndices.length - 2]].id, prevPop !== false ? polygon[prevPop].id : false, polygon[i].id, prevPrevPop !== false ? polygon[prevPrevPop].id : false,
            //         prevPop ? orientation(polygon[polygonIndices[polygonIndices.length - 2]], polygon[prevPop], polygon[i]) : false,
            //         prevPop ? orientation(polygon[prevPop - 1], polygon[prevPop], polygon[i]) : false,
            //         orientation(polygon[polygonIndices[polygonIndices.length - 3]], polygon[polygonIndices[polygonIndices.length - 2]], polygon[i]),
            //         orientation(polygon[i], polygon[polygonIndices[0]], polygon[polygonIndices[1]]),
            //         orientation(polygon[polygonIndices[0]], polygon[polygonIndices[1]], polygon[i]));

                // orientation(polygon[i], polygon[polygonIndices[0]], polygon[polygonIndices[polygonIndices.length - 1]]),
                // crossTest(polygon[polygonIndices[polygonIndices.length - 3]], polygon[polygonIndices[polygonIndices.length - 2]], polygon[polygonIndices[polygonIndices.length - 1]], polygon[i], polygon[i - 1], polygon[i - 2]));
                // lineLineIntersect([polygon[polygonIndices[polygonIndices.length - 2]], polygon[polygonIndices[polygonIndices.length - 1]]],
                //     [polygon[polygonIndices[0]], polygon[i]]),
                // orientation(polygon[polygonIndices[polygonIndices.length - 3]], polygon[polygonIndices[polygonIndices.length - 2]], polygon[i]));
                // orientation(polygon[polygonIndices[polygonIndices.length - 1] - 1], polygon[polygonIndices[polygonIndices.length - 1]], polygon[i]),
                // polygonIndices.length >= 3 ? orientation(polygon[polygonIndices[polygonIndices.length - 3]], polygon[polygonIndices[polygonIndices.length - 2]], polygon[i]) : false);

            // console.log(polygonIndices.slice(0), pocketIndices.slice(0));
            // console.log(polygonIndices.length - 2, polygonIndices.length - 1, i,
            //         polygon[polygonIndices[polygonIndices.length - 2]].toString(),
            //         polygon[polygonIndices[polygonIndices.length - 1]].toString(), polygon[i].toString());
            // console.log(orientation(polygon[polygonIndices[polygonIndices.length - 2]], polygon[polygonIndices[polygonIndices.length - 1]], polygon[i]),
            //     prevCase === true ? true : orientation(...prevCase, polygon[i]));

            // if (polygonIndices.length > 2)
            // if (polygonIndices.length > 3)
            //     console.log("TESTING....", orientation(polygon[polygonIndices[polygonIndices.length - 2]], polygon[polygonIndices[polygonIndices.length - 1]], polygon[i]) === 2 &&
            //         orientation(polygon[polygonIndices[polygonIndices.length - 1] - 1], polygon[polygonIndices[polygonIndices.length - 1]], polygon[i]) === LEFT &&
            //         orientation(polygon[polygonIndices[polygonIndices.length - 3]], polygon[polygonIndices[polygonIndices.length - 2]], polygon[i]) !== RIGHT);
                // console.log("specialCase", polygon[polygonIndices[polygonIndices.length - 1] - 1].toString(),
                //     polygon[polygonIndices[polygonIndices.length - 1]].toString(), polygon[i].toString(),
                //     orientation(polygon[polygonIndices[polygonIndices.length - 1] - 1], polygon[polygonIndices[polygonIndices.length - 1]], polygon[i]) === LEFT,
                //     orientation(polygon[polygonIndices[polygonIndices.length - 3]], polygon[polygonIndices[polygonIndices.length - 2]], polygon[i]) !== RIGHT);

            //Points are immediately possible they are to the left or colinear with the last two current points and not equal to either of the last two points
            if (check(polygon, polygonIndices, i)) {
            // if ((orientation(polygon[polygonIndices[polygonIndices.length - 2]], polygon[polygonIndices[polygonIndices.length - 1]], polygon[i]) !== RIGHT &&
            //      orientation(polygon[i], polygon[polygonIndices[0]], polygon[polygonIndices[1]]) !== RIGHT &&
            //      orientation(polygon[polygonIndices[0]], polygon[polygonIndices[1]], polygon[i]) !== RIGHT) ||
            //     (polygonIndices.length >= 3 && polygon[i - 1] === polygon[polygonIndices[polygonIndices.length - 1]] &&
            //      polygonIndices[polygonIndices.length - 1] - polygonIndices[polygonIndices.length - 2] > 1 &&
            //      prevPop !== false && (orientation(polygon[polygonIndices[polygonIndices.length - 2]], polygon[prevPop], polygon[i]) !== RIGHT ||
            //       orientation(polygon[prevPop - 1], polygon[prevPop], polygon[i]) !== RIGHT) &&
            //     //  orientation(polygon[i - 1], polygon[polygonIndices[0]], polygon[i]) === LEFT &&
            //     //  orientation(polygon[i - 1], polygon[polygonIndices[polygonIndices.length - 2]], polygon[i]) === LEFT &&
            //      orientation(polygon[polygonIndices[polygonIndices.length - 3]], polygon[polygonIndices[polygonIndices.length - 2]], polygon[i]) !== RIGHT &&
            //      orientation(polygon[i], polygon[polygonIndices[0]], polygon[polygonIndices[1]]) !== RIGHT &&
            //      orientation(polygon[polygonIndices[0]], polygon[polygonIndices[1]], polygon[i]) !== RIGHT)) {

                checks.push([polygonIndices[polygonIndices.length - 1], i]);

                // while (orientation(polygon[polygonIndices[polygonIndices.length - 3]], polygon[polygonIndices[polygonIndices.length - 3]], polygon[i])
                // console.log(polygon[polygonIndices[polygonIndices.length - 1]].toString(), polygon[i].toString(), polygon[polygonIndices[0]].toString());
                // console.log(orientation(
                //     polygon[polygonIndices[polygonIndices.length - 1]],
                //     polygon[i],
                //     polygon[polygonIndices[0]]));

                while (polygonIndices.length > 2 && orientation(polygon[polygonIndices[polygonIndices.length - 1]], polygon[i], polygon[polygonIndices[0]]) === 2) {
                    // prevPrevPop = prevPop !== false ? prevPop : polygonIndices[polygonIndices.length - 2];
                    pocketIndices.push(polygonIndices.pop());
                    checks.pop();
                    checks.push([polygonIndices[polygonIndices.length - 1], i]);
                }

                polygonIndices.push(i);

                // prevCase = true;

            // } else if (crossTest(polygon[polygonIndices[polygonIndices.length - 3]], polygon[polygonIndices[polygonIndices.length - 2]], polygon[polygonIndices[polygonIndices.length - 1]], polygon[i], polygon[i - 1], polygon[i - 2])) {
            } else if (false) {

            // } else if (lineLineIntersect([polygon[polygonIndices[polygonIndices.length - 2]], polygon[polygonIndices[polygonIndices.length - 1]]],
            //             [polygon[polygonIndices[0]], polygon[i]]) &&
            //             orientation(polygon[polygonIndices[polygonIndices.length - 3]], polygon[polygonIndices[polygonIndices.length - 2]], polygon[i]) !== RIGHT) {

                pocketIndices.push(polygonIndices.pop());

                while (polygonIndices.length > 2 && orientation(polygon[polygonIndices[polygonIndices.length - 1]], polygon[i], polygon[polygonIndices[0]]) === 2)
                    pocketIndices.push(polygonIndices.pop());

                polygonIndices.push(i);

            //Otherwise it forms a pocket
            } else {
                pocketIndices.push(i);
            }

        }

        console.log(stringifyArrayContents(arrayFromArrayIndicies(polygon, polygonIndices)).join(" "));

        // console.log("KICK TEST");
        // console.log(polygonIndices.slice(0), pocketIndices.slice(0));
        // console.log(polygonIndices.length - 2, polygonIndices.length - 1, 0,
        // console.log(polygon[polygonIndices[polygonIndices.length - 2]].toString(), polygon[polygonIndices[polygonIndices.length - 1]].toString(), polygon[polygonIndices[0]].toString());
        // console.log(orientation(polygon[polygonIndices[polygonIndices.length - 2]], polygon[polygonIndices[polygonIndices.length - 1]], polygon[polygonIndices[0]]));

        // The last joiner might not actually allowed! Check it and kick it out if it isn't
        // while (polygonIndices.length > 2 &&
        while (polygonIndices.length > 3 &&
                orientation(polygon[polygonIndices[polygonIndices.length - 2]], polygon[polygonIndices[polygonIndices.length - 1]], polygon[polygonIndices[0]]) === 2)
            pocketIndices.push(polygonIndices.splice(polygonIndices.length - 2, 1)[0]);
        // while (orientation(polygon[polygonIndices[polygonIndices.length - 2]], polygon[polygonIndices[polygonIndices.length - 1]], polygon[polygonIndices[0]]) === 2)
            // pocketIndices.push(polygonIndices.splice(polygonIndices.length - 2, 1)[0]);
        // if (orientation(polygon[polygonIndices[polygonIndices.length - 2]], polygon[polygonIndices[polygonIndices.length - 1]], polygon[polygonIndices[0]]) === 2) {
        //     pocketIndices.push(polygonIndices.splice(polygonIndices.length - 2, 1)[0]);
        //     // console.log(polygon[polygonIndices[polygonIndices.length - 1]].toString());
        // }

        pocketIndices.sort((a, b) => a - b);

        let polygons = [arrayFromArrayIndicies(polygon, polygonIndices)];

        new window.drawing.Path(polygons[0]).fill("rgba(255,0,0,.5)").close().width(1).draw().append();

        console.log("result", `(${polygonIndices.map(i => polygon[i].id).join(" ")})`, `(${polygons[0].map(p => p.toString()).join(" ")})`);
        console.log("remaining", `(${pocketIndices.map(i => polygon[i].id).join(" ")})`, `(${pocketIndices.map(i => polygon[i].toString()).join(" ")})`);
        // console.log("result", "(" + stringifyArrayContents(polygonIndices).join(" ") + ")", "(" + stringifyArrayContents(polygons[0]).join(" ") + ")");
        // console.log("remaining", "(" + stringifyArrayContents(pocketIndices).join(" ") + ")",
        //     "(" + stringifyArrayContents(arrayFromArrayIndicies(polygon, pocketIndices)).join(" ") + ")");

        for (let i = 0, start = 0; i < pocketIndices.length; i++)

            //We are at the end, so the pocket ends...
            if (i + 1 === pocketIndices.length)
                // console.log("last pocket");
                // console.log(pocketIndices[start] ? pocketIndices[start] - 1 : pocketIndices[pocketIndices.length - 1],
                //     ...pocketIndices.slice(start, i + 1), (pocketIndices[i] + 1) % polygon.length);
                // console.log(
                //     stringifyArrayContents(
                //         arrayFromArrayIndicies(polygon, [pocketIndices[start] ? pocketIndices[start] - 1 : pocketIndices[pocketIndices.length - 1],
                //             ...pocketIndices.slice(start, i + 1), (pocketIndices[i] + 1) % polygon.length])
                //     ).join(" ")
                // );
                polygons.push(...mosaic(arrayFromArrayIndicies(polygon, [
                    pocketIndices[start] ? pocketIndices[start] - 1 : pocketIndices[pocketIndices.length - 1],
                    ...pocketIndices.slice(start, i + 1),
                    (pocketIndices[i] + 1) % polygon.length
                ]), recursionLevel + 1));

            //Indicies jumped, so create a pocket and adjust start
            else if (pocketIndices[i + 1] - pocketIndices[i] > 1) {
                // console.log("interm pocket");
                polygons.push(...mosaic(arrayFromArrayIndicies(polygon, [
                    pocketIndices[start] ? pocketIndices[start] - 1 : pocketIndices[pocketIndices.length - 1],
                    ...pocketIndices.slice(start, i + 1),
                    (pocketIndices[i] + 1) % polygon.length
                ]), recursionLevel + 1));

                start = i + 1;

            }

        return polygons;

    }

    window.geo = {
        linePolygonIntersect: linePolygonIntersect,
        linePolygonsIntersect: linePolygonsIntersect,
        linePolygonsIntersect2: linePolygonsIntersect2,
        pointInPolygon: pointInPolygon,
        pointInPolygons: pointInPolygons,
        distanceBetweenPoints: distanceBetweenPoints,
        orientation: orientation,
        inclusiveBetween: inclusiveBetween,
        exclusiveBetween: exclusiveBetween,
        nearestPoint: nearestPoint,
        perpPoint: perpPoint,
        mergePolygons: mergePolygons,
        growPolygon: growPolygon,
        growPolygons: growPolygons,
        boxIntersect: boxIntersect,
        angleIntersection: angleIntersection,
        angleUnion: angleUnion,
        angleBetweenPoints: angleBetweenPoints,
        goingLeft: goingLeft,
        bridgeHole: bridgeHole,
        mosaic: mosaic,
        lineLineIntersect: lineLineIntersect,
        merge: merge
    };

}(window));
