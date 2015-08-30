//Midpoint in poly test is expensively redundent to keep doing >.<
(function (window) {
    "use strict";
    
    var ClipperLib = window.ClipperLib,
        
        cpr = new ClipperLib.Clipper(),
        co = new ClipperLib.ClipperOffset(2, 0.25),
        
        PI2 = Math.PI * 2;
    
    function distanceBetweenPoints(a, b) {
        var dx = b.x - a.x,
            dy = b.y - a.y;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
    
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
    
    function pointInPolygon(point, polygon) {
        
        var inside = false,
            
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
        
        var i;
        
        for (i = 0; i < polygons.length; i++)
            if (pointInPolygon(point, polygons[i])) return polygons[i];
        
        return false;
        
    }
    
    function pointInPolygonsAll(point, polygons) {
        
        var foundPolygons = [],
            
            i;
        
        for (i = 0; i < polygons.length; i++)
            if (pointInPolygon(point, polygons[i])) foundPolygons.push(polygons[i]);
        
        if (foundPolygons.length)
            return foundPolygons;
        
        return false;
        
    }
    
    function orientation(start, end, c) {
        var val = (end.y - start.y) * (c.x - end.x) -
            (end.x - start.x) * (c.y - end.y);

        //Colinear (floating point...)
        //if (val === 0) return 0;
        //if (Math.abs(val) <= 1e-7) return 0;
        if (val >= -1e-7 && val <= 1e-7) return 0;

        //Clock or counterclock wise
        return val > 0 ? 1 : 2;
    }
    
    function linePolygonIntersect(start, end, polygon) {
        
        var max = {
                x: Math.max(start.x, end.x),
                y: Math.max(start.y, end.y)
            },
            min = {
                x: Math.min(start.x, end.x),
                y: Math.min(start.y, end.y)
            },
            
            o1, o2, o3, o4,
            
            i, n;
        
        for (i = 0; i < polygon.length; i++) {
            n = (i + 1) % polygon.length;
            
            //Box testing
            if (max.x < Math.min(polygon[i].x, polygon[n].x) || min.x > Math.max(polygon[i].x, polygon[n].x) ||
                max.y < Math.min(polygon[i].y, polygon[n].y) || min.y > Math.max(polygon[i].y, polygon[n].y))
                continue;
            
            o1 = orientation(start, end, polygon[i]);
            o2 = orientation(start, end, polygon[n]);
            o3 = orientation(polygon[i], polygon[n], start);
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
        
        return pointInPolygon({x: (start.x + end.x) / 2, y: (start.y + end.y) / 2}, polygon);
        
    }
    
    function linePolygonsIntersect(start, end, polygons) {
        
		var max = {
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
    
    var checkNum = 0;
    
    function linePolygonsIntersect2(start, end, spatial, recent) {
        
		var max = {
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
        var count = 0,
            doing = (start.x === 772 && start.y === 124 && end.x === 1148 && end.y === 260) ||
                    (end.x === 772 && end.y === 124 && start.x === 1148 && start.y === 260);
        if (doing) console.log(start, end);
        while ((polygons = query.next().value)) {
            if (doing) console.log(count++, polygons);
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
        
        var max = {
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
        
        var dx = b.x - a.x,
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
        
        var combinedPolygon = new ClipperLib.Paths();
        
        co.Clear();
        co.AddPaths(polygons, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);
        co.Execute(combinedPolygon, 1);
        
        if (combinedPolygon.length === 1)
            return combinedPolygon[0];
        
        return combinedPolygon;
    }
    
    function growPolygon(polygon, polygons, alreadyIncluded) {
        
        var tPolygons,
            
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
        
        var i;
        
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
        
        var nearPoint = null,
            nearDistance = Number.POSITIVE_INFINITY,
            
            distance, tPoint, tPolygon, combinedPolygon,
            
            i, n;
        
        if (typeof polygon === "undefined") {
            polygon = pointInPolygonsAll(point, polygons);
            if (!polygon) return point;
            
            polygon = mergePolygons(polygon);
            if (typeof polygon[0].x === "undefined")
                polygon = polygon[0];
            console.log("merged", polygon);
        } console.log("passed", polygon);
        
        if (typeof polygon.x === "number") console.error("invalid polygon!");
        
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
        console.log(nearPoint);
        tPolygon = pointInPolygonsAll(nearPoint, polygons);
        if (tPolygon) {
            
            combinedPolygon = new ClipperLib.Paths();
            
            co.Clear();
            co.AddPaths(tPolygon, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);
            co.Execute(combinedPolygon, 1);
            
            cpr.Clear();
            cpr.AddPaths([polygon, combinedPolygon[0]], ClipperLib.PolyType.ptClip, true);
            cpr.Execute(ClipperLib.ClipType.ctUnion, combinedPolygon,
                        ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
            
            if (typeof combinedPolygon[0].x === "undefined")
                combinedPolygon = combinedPolygon[0];
            
            return nearestPoint(point, polygons, combinedPolygon);
        }
        
        return nearPoint;
        
    }
    
    window.Geo = {
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
        growPolygons: growPolygons
    };
    
}(window));
