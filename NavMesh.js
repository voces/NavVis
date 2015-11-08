
(function (window) {
    "use strict";

    let ClipperLib = window.ClipperLib,
        geo = window.geo,
        //PriorityQueue = window.PriorityQueue,
        //RecentArray = window.RecentArray,
        DQuadTree = window.DQuadTree,
        //QuadTree = window.QuadTree,
        //ExtendedArray = window.ExtendedArray,

        drawing = window.drawing,

        Color = window.Color,

        PointSet = window.PointSet,
        Point = window.Point,
        EdgeSet = window.EdgeSet,

        earcut = window.earcut,

        co = new ClipperLib.ClipperOffset(2, 0.25),
        cpr = new ClipperLib.Clipper();

    let curId = 0;

    /*function distanceBetweenPoints(a, b) {
        return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
    }*/

    function calcPolygonStats(polygon) {

        //Initialize the polygon's min and max
        polygon.min = {x: Infinity, y: Infinity};
        polygon.max = {x: -Infinity, y: -Infinity};

        //For calculating the center
        polygon.x = polygon.y = 0;

        for (let i = 0; i < polygon.length; i++) {

            //Sum (for calculating center)
            polygon.x += polygon[i].x;
            polygon.y += polygon[i].y;

            //Update this polygon's min/max
            if (polygon[i].x > polygon.max.x) polygon.max.x = polygon[i].x;
            if (polygon[i].y > polygon.max.y) polygon.max.y = polygon[i].y;
            if (polygon[i].x < polygon.min.x) polygon.min.x = polygon[i].x;
            if (polygon[i].y < polygon.min.y) polygon.min.y = polygon[i].y;
        }

        //Mean (for calculating center)
        polygon.x /= polygon.length;
        polygon.y /= polygon.length;

        //Initialize radius to zero
        polygon.radius = 0;

        //Find largest radius
        for (let i = 0; i < polygon.length; i++) {
            let distance = geo.distanceBetweenPoints(polygon, polygon[i]);
            if (distance > polygon.radius) polygon.radius = distance;
        }

    }

    function Base(navmesh, radius, newStatics) {

        let bounds;

        this.navmesh = navmesh;

        //The radius this base is using
        this.radius = radius;

        //A list of all nodes in the (active) graph
        this.graph = [];

        //A list of static polygons (all dynamics are grabbed from .pathing.dynamics)
        this.polygons = [];

        //A list of recently added polygons that have not been calculated yet
        this.newStatics = [];
        for (let i = 0; i < newStatics.length; i++)
            this.newStatics.push(newStatics[i]);

        //A list of recently removed polygons that have not been calculated yet and
        //  it's associated table (possibly removed by updating)
        this.deadStatics = [];

        //A list of all concave polygons in the graph (inverted space from this.polygons)

        this.pointSet = new PointSet();
        this.edgeSet = new EdgeSet();

        bounds = this.generateBounds();

        //bounds.x = (bounds[0] + bounds[2]) / 2;
        //bounds.y = (bounds[1] + bounds[5]) / 2;
        //bounds.radius = distanceBetweenPoints({x: bounds[0], y: bounds[1]}, bounds);

        this.mesh = [bounds];
        this.walkableQT = new DQuadTree(16, null, bounds[0], bounds[2]);
        this.obstacleQT = new DQuadTree(32, null, bounds[0], bounds[2]);
        this.walkableQT.push(bounds);

    }

    Base.prototype.generateBounds = function() {

        let polygon = [
            this.pointSet.getPoint(this.navmesh.minX + this.radius, this.navmesh.minY + this.radius),
            this.pointSet.getPoint(this.navmesh.maxX - this.radius, this.navmesh.minY + this.radius),
            this.pointSet.getPoint(this.navmesh.maxX - this.radius, this.navmesh.maxY - this.radius),
            this.pointSet.getPoint(this.navmesh.minX + this.radius, this.navmesh.maxY - this.radius)
        ];

        calcPolygonStats(polygon);

        return polygon;

    };

    Base.prototype.reformPolygon = function(polygon) {

        for (let i = 0; i < polygon.length; i++)
            polygon[i] = this.pointSet.getPoint(polygon[i].x, polygon[i].y);

    };

    Base.prototype.meshIntersectRough = function(polygon, check, source) {

        source = source || this.walkableQT;

        //A generator that returns one cell at a time
        let query = source.queryRange(polygon.min.x, polygon.min.y,
                                      polygon.max.x, polygon.max.y, polygon.radius),
        //var query = this.walkableQT.queryLine(polygon.min, polygon.max, polygon.radius),

            meshes = [],

            result,

            i;

        //Grab the next cell of meshes (occurs due to MeshIntersectRoughMultiple)
        while (result = query.next().value)

            //Ignore cells we've already hit
            if (result.meshIntersectRoughCheck !== check) {

                //Loop through each mesh
                for (i = 0; i < result.length; i++)

                    //Ignore meshes we've already hit
                    if (result[i].meshIntersectRoughCheck !== check) {

                        //Add and mark the mesh
                        meshes.push(result[i]);
                        result[i].meshIntersectRoughCheck = check;
                    }

                //Mark the cell
                result.meshIntersectRoughCheck = check;
            }

        return meshes;

    };

    //Simple box testing
    function doPolygonsIntersect(testMesh) {

        if (this.polygon.max.x < testMesh.min.x || this.polygon.min.x > testMesh.max.x ||
            this.polygon.max.y < testMesh.min.y || this.polygon.min.y > testMesh.max.y)
            return false;

        return true;

    }

    Base.prototype.meshIntersectMultiple = function(polygons, source) {

        source = source || this.walkableQT;

        let meshes = [];

        //Loop through each polygon, adding cells/meshes one at a time
        for (let i = 0; i < polygons.length; i++)
            meshes = meshes.concat(
                this.meshIntersectRough(polygons[i], Base.meshIntersectMultipleChecks, source)
                    .filter(doPolygonsIntersect, {polygon: polygons[i]}));

        //Inc our checker
        Base.meshIntersectMultipleChecks++;

        return meshes;

    };

    Base.meshIntersectMultipleChecks = 0;

    Base.prototype.polygonOrientation = function (object) {

        let tPolygon = new ClipperLib.Paths(), polygon;

        /*eslint-disable new-cap*/
        co.Clear();
        co.AddPath(object, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);
        co.Execute(tPolygon, this.radius);
        /*eslint-enable new-cap*/

        polygon = tPolygon[0];
        polygon.holes = tPolygon.slice(1);

        this.reformPolygon(polygon);
        for (let i = 0; i < polygon.holes.length; i++)
            this.reformPolygon(polygon.holes[i]);

        //Initialize the polygon's min and max
        polygon.min = {x: Infinity, y: Infinity};
        polygon.max = {x: -Infinity, y: -Infinity};

        //For calculating the center
        polygon.x = polygon.y = 0;

        for (let i = 0; i < polygon.length; i++) {

            //Sum (for calculating center)
            polygon.x += polygon[i].x;
            polygon.y += polygon[i].y;

            //Update this polygon's min/max
            if (polygon[i].x > polygon.max.x) polygon.max.x = polygon[i].x;
            if (polygon[i].y > polygon.max.y) polygon.max.y = polygon[i].y;
            if (polygon[i].x < polygon.min.x) polygon.min.x = polygon[i].x;
            if (polygon[i].y < polygon.min.y) polygon.min.y = polygon[i].y;
        }

        //Mean (for calculating center)
        polygon.x /= polygon.length;
        polygon.y /= polygon.length;

        //Initialize radius to zero
        polygon.radius = 0;

        //Find largest radius
        for (let i = 0; i < polygon.length; i++) {
            let distance = geo.distanceBetweenPoints(polygon, polygon[i]);
            if (distance > polygon.radius) polygon.radius = distance;
        }

        //Push the polygon into both the polygon and newpolygon list
        this.polygons.push(polygon);
        this.obstacleQT.push(polygon);
        //this.newPolygons.push(polygon);

        //Add a reference from the original object to the polygon
        object[this.navmesh.id].polygons[this.radius] = polygon;
        object[this.navmesh.id].count++;

        //Initiate blocks to an empty array (not blocking anything)
        //polygon.blocks = [];

        //A list of all segments that connect to this polygon, including blocked ones
        //polygon.segments = [];

    };

    Base.prototype.dropPolygon = function (/*polygon*/) {



    };

    function replaceArrayContents(a, b) {
        a.splice.apply(a, [0, a.length].concat(b));
    }

    function forSwapReverse(array) {
        let arr = [];

        for (let left = 0, right = array.length - 1; left < right; left++, right--) {
            arr[left] = array[right];
            arr[right] = array[left];
        }

        if (arr.length % 2 === 1)
            arr[(arr.length - 1) / 2] = array[(arr.length - 1) / 2];

        return arr;
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

    function mergeSimple(a, b, start, end) {

        let aStart, aEnd,
            bStart, bEnd,

            aDirection,
            bDirection,

            arr;

        //Find start/end in a
        for (let i = 0; i < a.length; i++)
            if (a[i] === start) {
                aStart = i;
                if (typeof aEnd !== "undefined") break;
            } else if (a[i] === end) {
                aEnd = i;
                if (typeof aStart !== "undefined") break;
            }

        //Find start/end in b
        for (let i = 0; i < b.length; i++)
            if (b[i] === start) {
                bStart = i;
                if (typeof bEnd !== "undefined") break;
            } else if (b[i] === end) {
                bEnd = i;
                if (typeof bStart !== "undefined") break;
            }

        aDirection = goingLeft(aStart, aEnd, a.length);
        bDirection = goingLeft(bStart, bEnd, b.length);

        //Reverse b if order is same as a
        if (aDirection === bDirection) {
            bDirection = !bDirection;

            b = forSwapReverse(b);
            bStart = b.length - bStart - 1;
            bEnd = b.length - bEnd - 1;
        }

        //Grab first part of a
        if (aDirection) arr = a.slice(aStart === 0 ? aStart : 0, aEnd + 1);
        else arr = a.slice(aEnd === 0 ? aEnd : 0, aStart + 1);

        //Grab second part from end of b
        if (bDirection) arr = arr.concat(b.slice(bStart + 1, bStart === 0 ? bEnd : b.length));
        else arr = arr.concat(b.slice(bEnd + 1, bEnd === 0 ? bStart : b.length));

        //Grab third part from beginning of b
        if (bDirection && bStart !== 0) arr = arr.concat(b.slice(0, bEnd));
        else if (!bDirection && bEnd !== 0) arr = arr.concat(b.slice(0, bStart));

        //Grab fourth part from a
        if (aDirection) arr = arr.concat(a.slice(aEnd + 1, a.length));
        else arr = arr.concat(a.slice(aStart, a.length));

        //Remove useless points (i.e., colinear to surrounding points)
        for (let i = 0; i < arr.length; i++)
            if (geo.orientation(arr[i ? i - 1 : arr.length - 1], arr[(i + 1) % arr.length], arr[i]) === 0) {
                arr.splice(i, 1);
                i--;
            }

        replaceArrayContents(a, arr);

        return a;

    }

    /*function angleBetweenPoints(a, b, c) {
        return Math.atan2(b.y - a.y, b.x - a.x) - Math.atan2(c.y - a.y, c.x - a.x);
    }*/

    function rPoint(polygon, point) {
        return polygon[(polygon.indexOf(point) + 1) % polygon.length];
    }

    function lPoint(polygon, point) {
        return polygon[(polygon.indexOf(point) || polygon.length) - 1];
    }

    function convexTest(pointA, pointB, edge) {

        /*console.log("\t\t\t", goingLeft(edge.cells[0].indexOf(pointA), edge.cells[0].indexOf(pointB),
            edge.cells[0].length), goingLeft(edge.cells[1].indexOf(pointA), edge.cells[1].indexOf(pointB),
            edge.cells[1].length));*/
        /*console.log(pointA, pointB);
        console.log(edge);
        console.log(rPoint(edge.cells[0], pointA), lPoint(edge.cells[1], pointA));
        console.log(rPoint(edge.cells[1], pointB), lPoint(edge.cells[0], pointB));*/
        if (goingLeft(edge.cells[0].indexOf(pointA), edge.cells[0].indexOf(pointB), edge.cells[0].length))

            if (goingLeft(edge.cells[1].indexOf(pointA), edge.cells[1].indexOf(pointB), edge.cells[1].length))
                /*console.log("\t\t\t", "tt", rPoint(edge.cells[0], pointA).toString(), lPoint(edge.cells[1],
                    pointA.toString()), pointA.toString(), geo.orientation(rPoint(edge.cells[0], pointA),
                    lPoint(edge.cells[1], pointA), pointA));
                console.log("\t\t\t", "tt", rPoint(edge.cells[1], pointB).toString(), lPoint(edge.cells[0],
                    pointB.toString()), pointB.toString(), geo.orientation(rPoint(edge.cells[1], pointB),
                    lPoint(edge.cells[0], pointB), pointB));*/

                return (geo.orientation(rPoint(edge.cells[0], pointA), lPoint(edge.cells[1], pointA), pointA) !== 1 &&
                        geo.orientation(rPoint(edge.cells[1], pointB), lPoint(edge.cells[0], pointB), pointB) !== 1);

            else
                /*console.log("\t\t\t", "tf", rPoint(edge.cells[0], pointA).toString(), lPoint(edge.cells[1],
                    pointA).toString(), pointA.toString(), geo.orientation(rPoint(edge.cells[0], pointA),
                    lPoint(edge.cells[1], pointA), pointA));
                console.log("\t\t\t", "tf", rPoint(edge.cells[1], pointB).toString(), lPoint(edge.cells[0],
                    pointB).toString(), pointB.toString(), geo.orientation(rPoint(edge.cells[1], pointB),
                    lPoint(edge.cells[0], pointB), pointB));*/

                return (geo.orientation(rPoint(edge.cells[0], pointA), lPoint(edge.cells[1], pointA), pointA) !== 1 &&
                        geo.orientation(rPoint(edge.cells[1], pointB), lPoint(edge.cells[0], pointB), pointB) !== 1);

        else if (goingLeft(edge.cells[1].indexOf(pointA), edge.cells[1].indexOf(pointB), edge.cells[1].length))
            /*console.log(edge.cells[1].indexOf(pointA), (edge.cells[1].indexOf(pointA) + 1) % edge.cells[1].length);
            console.log("\t\t\t", "ft", rPoint(edge.cells[1], pointA).toString(), lPoint(edge.cells[0],
                pointA).toString(), pointA.toString(), geo.orientation(rPoint(edge.cells[1], pointA),
                lPoint(edge.cells[0], pointA), pointA));
            console.log("\t\t\t", "ft", rPoint(edge.cells[0], pointB).toString(), lPoint(edge.cells[1],
                pointB).toString(), pointB.toString(), geo.orientation(rPoint(edge.cells[0], pointB),
                lPoint(edge.cells[1], pointB), pointB));*/

            return (geo.orientation(rPoint(edge.cells[1], pointA), lPoint(edge.cells[0], pointA), pointA) !== 1 &&
                    geo.orientation(rPoint(edge.cells[0], pointB), lPoint(edge.cells[1], pointB), pointB) !== 1);

        else
            /*console.log("\t\t\t", "ff", rPoint(edge.cells[0], pointA).toString(), lPoint(edge.cells[1],
                pointA).toString(), pointA.toString(), geo.orientation(rPoint(edge.cells[0], pointA),
                lPoint(edge.cells[1], pointA), pointA));
            console.log("\t\t\t", "ff", rPoint(edge.cells[1], pointB).toString(), lPoint(edge.cells[0],
                pointB).toString(), pointB.toString(), geo.orientation(rPoint(edge.cells[1], pointB),
                lPoint(edge.cells[0], pointB), pointB));*/

            return (geo.orientation(rPoint(edge.cells[0], pointA), lPoint(edge.cells[1], pointA), pointA) !== 1 &&
                    geo.orientation(rPoint(edge.cells[1], pointB), lPoint(edge.cells[0], pointB), pointB) !== 1);

    }

    Base.prototype.mergeInPolygon = function(polygon, polygons, noAdd) {

        let addPolygon = true,

            vertices = polygon.slice(0);

        //console.log(polygon.id, polygon.colorName);
        //if (polygon.id === 80) alertEnabled = true;

        for (let i = 0; i < vertices.length; i++) {

            //For easy access of each end point of the edge
            let pointA = vertices[i];
            let pointB = vertices[(i + 1) % vertices.length];

            //console.log(polygon.indexOf(pointA), i, addPolygon, noAdd);
            if (polygon.indexOf(pointA) < 0) continue;

            //The edge (edge)
            let edge = this.edgeSet.getEdge(pointA, pointB);

            //if (edge.id === 26) console.log("EDGE!", polygon.id, polygon.colorName);

            //console.log("\t", i, "test", pointA.toString(), pointB.toString());
            //if (edge.cells[0]) console.log("\t\t", edge.cells[0].id, edge.cells[0].colorName);

            //Push the triangle into the polygons that use the pair (edge), check if we now have both sides of said
            //  edge. Check to see if we can add the polygons that share the edge together (simple 180 angle testing)
            if (((noAdd && edge.cells.length === 2) || (!noAdd && edge.cells.push(polygon) === 2)) &&
                convexTest(pointA, pointB, edge)) {

                /*console.log("\t", edge.cells[1].id, edge.cells[1].colorName, "==>", edge.cells[0].id,
                    edge.cells[0].colorName);*/

                //console.log(pointListToString(edge.cells[0]));
                //Merge the polygons; pair.cells[0] is automatically updated (triangle is essentially set to it)
                let original = [];

                if (edge.cells[0] !== polygon)
                    original = edge.cells[0].slice(0);

                polygon = mergeSimple(edge.cells[0], edge.cells[1], pointA, pointB);
                //console.log(window.pointListToString(polygon));

                //Loop through the points that make up the new cell
                for (let n = 0; n < edge.cells[1].length; n++) {

                    //Grab an edge of the point
                    let tEdge = this.edgeSet.getEdge(edge.cells[1][n], edge.cells[1][(n + 1) % edge.cells[1].length]);

                    //console.log(n, edge.toString(), tEdge.toString ());

                    //Skip if we're working on the dying edge
                    if (edge === tEdge) continue;
                    else if (polygon.indexOf(tEdge[0]) < 0 || polygon.indexOf(tEdge[1]) < 0) {

                        if (tEdge.cells[0] === edge.cells[1]) tEdge.cells.shift();
                        else if (tEdge.cells[1] === edge.cells[1]) tEdge.cells.pop();

                        //console.log(tEdge[0].toString(), tEdge[1].toString(), tEdge.cells.slice(0));
                        if (tEdge.cells.length === 0) this.edgeSet.dropEdge(tEdge);

                    } else if (tEdge.cells[0] === edge.cells[1]) tEdge.cells[0] = polygon;
                    else if (tEdge.cells[1] === edge.cells[1]) tEdge.cells[1] = polygon;

                }

                //Drop collapsed edges (if edge.cells[0] was not equal to polygon)
                for (let n = 0; n < original.length; n++)
                    if (polygon.indexOf(original[n]) < 0) {
                        //console.log("collapse", original[n].toString(), original[n ? n - 1 : original.length - 1].toString());
                        this.edgeSet.dropEdge(original[n], original[n ? n - 1 : original.length - 1]);
                        this.edgeSet.dropEdge(original[n], original[(n + 1) % original.length]);
                    } else
                        //console.log("keep", original[n].toString(), original[n ? n - 1 : original.length - 1].toString());

                //The edge was merged into two other polygons; drop it
                this.edgeSet.dropEdge(edge);

                //Since the triangle was merged with an existing one, don't add it
                addPolygon = false;

                //The active triangle we're working on was already added to another, meaning we are actually
                //  doing a second merging, meaning we're merging two existing polygons... so remove one
                let index = polygons.indexOf(edge.cells[1]);
                if (index >= 0) polygons.splice(index, 1);
                else if (typeof edge.cells[1][this.walkableQT.id] !== "undefined")
                    this.walkableQT.remove(edge.cells[1]);

            }

            //Working edge was collapsed (i.e., it was colinear)
            if (polygon.indexOf(edge[0]) < 0 || polygon.indexOf(edge[1]) < 0) {
                let index = edge.cells.indexOf(polygon);
                if (index >= 0) edge.cells.splice(index, 1);
            }

        }

        //Check the vertices of the merged polygon to see if any disappeared; if they did, drop them
        for (let i = 0; i < vertices.length; i++)
            if (polygon.indexOf(vertices[i]) < 0)
                this.edgeSet.dropEdge(vertices[i], rPoint(polygon, vertices[i]));

        //TODO: remove this if it never triggers
        for (let i = 0; i < vertices.length; i++)
            if (polygon.indexOf(vertices[i]) < 0 && this.edgeSet.getEdgeNoCreate())
                alert("pass4 CHECK CODE");

        //If the polygon was merged previously and not merged this time, update it and be done
        if (noAdd && addPolygon && typeof polygon[this.walkableQT.id] !== "undefined") {
            //console.log("a");
            //polygons.splice(polygons.indexOf(edge.cells[1]), 1);

            this.walkableQT.remove(polygon);
            calcPolygonStats(polygon);
            this.walkableQT.push(polygon);

        //If the polygon was not merged
        } else if (!noAdd && addPolygon) {

            //console.log("b", polygon.id, polygon.colorName);

            //If the polygon was not merged previously, add it to the list and be done
            polygons.push(polygon);

            //If the polygon was merged previously, update it and be done
            /*if (typeof polygon[this.walkableQT.id] !== "undefined") {
                this.walkableQT.remove(polygon);
                calcPolygonStats(polygon);
                this.walkableQT.push(polygon);
            }*/

        //If the polygon was merged
        } else if (!noAdd && !addPolygon) {
            //console.log("c");
            this.mergeInPolygon(polygon, polygons, true);
        }

    };

    function subtract(subject, clip) {

        let result = new ClipperLib.PolyTree();

        /*eslint-disable new-cap*/
        cpr.Clear();

        cpr.AddPaths(subject, ClipperLib.PolyType.ptSubject, true);
        cpr.AddPaths(clip, ClipperLib.PolyType.ptClip, true);

        for (let i = 0; i < clip.length; i++)
            cpr.AddPaths(clip[i].holes, ClipperLib.PolyType.ptClip, true);

        cpr.Execute(ClipperLib.ClipType.ctDifference, result,
                    ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);

        result = ClipperLib.JS.PolyTreeToExPolygons(result);
        /*eslint-enable new-cap*/

        return result;

    }

    let alertEnabled = true;
    Base.prototype.clip = function(parent, holes) {

        let list = [], indicies = [],

            trianglesRaw, polygons = [];

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

        //Loop through all raw triangles
        for (let i = 0; i < trianglesRaw.length; i += 3) {

            //Get the three points of each triangle
            let a = this.pointSet.getPoint(list[trianglesRaw[i] * 2], list[trianglesRaw[i] * 2 + 1]);
            let b = this.pointSet.getPoint(list[trianglesRaw[i + 1] * 2], list[trianglesRaw[i + 1] * 2 + 1]);
            let c = this.pointSet.getPoint(list[trianglesRaw[i + 2] * 2], list[trianglesRaw[i + 2] * 2 + 1]);

            //Build it
            let triangle = [a, b, c];

            triangle.id = curId++;

            let color = Color.indexColor(triangle.id);

            triangle.colorName = color[0];
            triangle.color = color[1];

            //console.log(triangle.id, triangle.colorName, a.toString(), b.toString(), c.toString());

            //new drawing.Path(triangle).fill(triangle.color).close().width(0).append().draw().temp();

            /*for (n = 0; n < polygons.length; n++)
                console.log("\t", polygons[n].id, polygons[n].colorName);*/

            //Merge in the new triangle
            this.mergeInPolygon(triangle, polygons);

            /*drawing.clearTemp(); this.walkableQT.drawAll();
            for (let n = 0; n < polygons.length; n++)
                new drawing.Path(polygons[n]).fill(polygons[n].color).close().width(0).append().draw().temp();
            for (let n = i + 3; n < trianglesRaw.length; n += 3)
                new drawing.Path([
                    new Point(list[trianglesRaw[n] * 2], list[trianglesRaw[n] * 2 + 1]),
                    new Point(list[trianglesRaw[n + 1] * 2], list[trianglesRaw[n + 1] * 2 + 1]),
                    new Point(list[trianglesRaw[n + 2] * 2], list[trianglesRaw[n + 2] * 2 + 1])
                ]).close().width(0).append().draw().temp();
            if (alertEnabled) alert();
            console.log("");*/

            /*for (n = 0; n < polygons.length; n++)
                console.log("\t", polygons[n].id, polygons[n].colorName);*/

        }

        return polygons;

    };

    Base.prototype.killAffected = function(affectedMeshes) {

        //Loop through all affected meshes
        for (let i = 0; i < affectedMeshes.length; i++) {

            //console.log("remove", affectedMeshes[i].id, affectedMeshes[i].colorName);

            //Remove the mesh from the walkableQT
            this.walkableQT.remove(affectedMeshes[i]);

            //Loop through all points on the mesh
            for (let n = 0; n < affectedMeshes[i].length; n++) {

                //Remove the mesh from the point's cells list
                let index = affectedMeshes[i][n].cells.indexOf(affectedMeshes[i]);
                if (index >= 0) affectedMeshes[i][n].cells.splice(index, 1);

                //Grab the pair between the point and the next point
                let tPair = this.edgeSet.getEdge(affectedMeshes[i][n],
                    affectedMeshes[i][(n + 1) % affectedMeshes[i].length]);

                //Remove the mesh from the pair's cells list
                index = tPair.cells.indexOf(affectedMeshes[i]);
                if (index >= 0) tPair.cells.splice(index, 1);

                //Remove the lefts/rights associated with the mesh from the point
                /*affectedMeshes[i][n].lefts.delete(affectedMeshes[i]);
                affectedMeshes[i][n].rights.delete(affectedMeshes[i]);*/
            }

        }

    };

    Base.prototype.update = function () {

        drawing.clearTemp();

        let newMesh;

        //Only bother if there are some statics to remove
        if (this.deadStatics.length > 0) {

            let oldPolygons = [];

            for (let i = 0; i < this.deadStatics.length; i++) {
                oldPolygons.push(this.deadStatics[i][this.navmesh.id].polygons[this.radius]);
                this.obstacleQT.remove(this.deadStatics[i][this.navmesh.id].polygons[this.radius]);
            }

            let persistantPolygons = this.meshIntersectMultiple(oldPolygons, this.obstacleQT);

            //Subtract the still-existing polygons from the one's that are gone
            let clippedMesh = subtract(oldPolygons, persistantPolygons);

            //Loop through all the returned meshes; clip them one at a time
            for (let i = 0; i < clippedMesh.length; i++) {

                //Clip it
                newMesh = this.clip(clippedMesh[i].outer, clippedMesh[i].holes);

                //Add to the walkableQT
                for (let n = 0; n < newMesh.length; n++) {
                    calcPolygonStats(newMesh[n]);
                    this.walkableQT.push(newMesh[n]);
                }
            }

            this.deadStatics = [];

        }

        //Only bother if there are some new static objects
        if (this.newStatics.length > 0) {

            //Store the old length
            let oldLength = this.polygons.length;

            //Add new; block existing
            for (let i = 0; i < this.newStatics.length; i++)
                this.polygonOrientation(this.newStatics[i]);

            //Grab the polygons just added
            let newPolygons = this.polygons.slice(oldLength);

            //Grab the meshes's we're going to be working on
            //  TODO: this should be reduced to interesecting polygons (such test is probably cheaper than rebuilding
            //        paths)
            let affectedMeshes = this.meshIntersectMultiple(newPolygons);

            this.killAffected(affectedMeshes);

            //Subtract the new polygons from the old mesh; store it in clippedMesh
            let clippedMesh = subtract(affectedMeshes, newPolygons);

            //Loop through all the returned meshes; clip them one at a time
            for (let i = 0; i < clippedMesh.length; i++) {

                //Clip it
                newMesh = this.clip(clippedMesh[i].outer, clippedMesh[i].holes);

                //Add to the walkableQT
                for (let n = 0; n < newMesh.length; n++) {
                    calcPolygonStats(newMesh[n]);
                    this.walkableQT.push(newMesh[n]);
                }
            }

            this.newStatics = [];

        }

        //alert();
        //drawing.clearTemp(); this.walkableQT.drawAll();

    };

    let navmeshId = 0;
    function NavMesh(minX, minY, maxX, maxY) {

        //Contains calculated polygons and maps
        this.bases = [];
        this.indexedBases = [];

        //Contains static objects we navigate around (buildings, terrain, etc)
        this.statics = [];

        //Contains dynamic objects we navigate around (units)
        this.dynamics = [];

        //Contains the identifier of the NavMesh
        this.id = "_navmesh" + navmeshId++;

        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;

    }

    /**
     * Adds a static object
     * @param {object} object - An object with .footprint
     */
    NavMesh.prototype.addStatic = function (polygon) {

        //Quit if already added
        if (typeof polygon[this.id] === "object")
            return;

        //Push it
        this.statics.push(polygon);

        //Attach data
        polygon[this.id] = {
            isStatic: true,
            polygons: [],
            basesStati: [],
            count: 0
        };

        //Loop through bases to add/remove...
        for (let i = 0; i < this.bases.length; i++)

            //Add it
            this.bases[i].newStatics.push(polygon);

    };

    /**
     * Removes a static object
     * @param {object} object - An object or an index of said object
     */
    NavMesh.prototype.removeStatic = function (polygon) {

        //Ignore polygons that are not statics
        if (!polygon[this.id].isStatic) return;

        //Remove from the list of statics
        this.statics.splice(this.statics.indexOf(polygon), 1);

        //Remove from bases
        for (let i = 0; i < this.bases.length; i++)

            //Not yet added
            if (polygon[this.id].polygons[this.bases[i].radius] === undefined)

                //Remove from any new statics
                this.bases[i].newStatics.splice(this.bases[i].newStatics.indexOf(polygon), 1);

            //Not yet marked for removal
            else if (polygon[this.id].basesStati[i] !== 2) {

                this.bases[i].deadStatics.push(polygon);
                polygon[this.id].basesStati[i] = 2;

            }

    };

    /**
     * Adds a dynamic object
     * @param {object} object - An object with .x, .y, .radius, .facing, and .speed
     */
    NavMesh.prototype.addDynamic = function (object) {

        object.index = this.dynamics.push(object) - 1;

    };

    /**
     * Removes a dynamic object
     * @param {object} object - An object or an index of said object
     */
    NavMesh.prototype.removeDynamic = function (object) {

        if (typeof object === "number")
            this.dynamics.splice(object, 1);

        else
            this.dynamics.splice(this.dynamics.indexOf(object), 1);

    };

    /*function minDistance(i, j) {
        return i.dist + i.distToEnd < j.dist + j.distToEnd;
    }*/

    /**
     * Calculates a minimal path between two points
     * @param {Unit} object - A unit with .radius, .x, and .y
     * @param {Point} target - A target with .x and .y
     * @return {array} path - An array of points
     */
    NavMesh.prototype.path = function (object/*, target*/) {

        let base/*,

            i*/;

        //Grab the base (if it doesn't exist, create it)
        if (typeof this.indexedBases[object.radius] === "undefined")
            this.bases.push(base = this.indexedBases[object.radius] = new Base(this, object.radius, this.statics));

        else base = this.indexedBases[object.radius];

        //Update the base if required
        if (base.newStatics || base.deadStatics) base.update();

        /*return false;
        //One or both points already trapped
        //  TODO: Develop so if target is in a polygon, we test for the polygon's
        //          valid corners (and if those are in, check surrounding, etc)
        target = geo.nearestPoint(target, base.polygons, partialPolygons);
        //if (geo.pointInPolygons(target, base.polygons) || geo.pointInPolygons(object, base.polygons))
        //    return false;

        //Directly possible
        if (object.x === target.x && object.y === target.y)
            return [object];
        else if (geo.linePolygonsIntersect(object, target, base.polygons) === false)
            return [object, target];

        //Our starting point (used at the end)
        var start = {
                point: {
                    x: object.x,
                    y: object.y
                }
            },

            //A list of all points from the map, our temporary graph
            points = [],

            //A priority queue that has the shortest path at the top;
            tree = new PriorityQueue([], minDistance), top,

            //Once we reach the end with tree, these are used to trace back
            cur, path,

            //General looping variable
            n;

        for (i = 0; i < base.polygons.length; i++) {
            base.polygons[i].pCount = 0;
            base.polygons[i].endVisible = false;
        }

        //First loop through the base map to build our point list
        for (i = 0; i < base.map.length; i++) {

            //Set the id of the point in the map to our match (reduces need for indexOf)
            base.map[i].id = i;

            //Create a point with some initial data (n refers to the location in point list)
            n = points.push({
                distToEnd: geo.distanceBetweenPoints(target, base.map[i]),
                nodes: base.map[i].nodes,
                point: {
                    x: base.map[i].x,
                    y: base.map[i].y
                },
                polygon: base.map[i].polygon
            }) - 1;

            points[n].polygon.pCount++;

            //Immediately visible points; set prev and distance
            if (!geo.exclusiveBetween(Math.atan2(base.map[i].y - object.y, base.map[i].x - object.x),
                                      base.map[i].lAngle, base.map[i].rAngle) &&
                !geo.exclusiveBetween(Math.atan2(object.y - base.map[i].y, object.x - base.map[i].x),
                                      base.map[i].lAngle, base.map[i].rAngle) &&
                geo.linePolygonsIntersect(object, base.map[i], base.polygons) === false) {

                points[n].prev = start;
                points[n].dist = geo.distanceBetweenPoints(object, base.map[i]);
                tree.push(points[i]);

            //Not visible, so assume it's disconnected
            } else {
                points[n].prev = null;
                points[n].dist = Infinity;
            }

        }

        //Mark points that can see the end (we do this outside of the above loop to take advantage of common
        //  intersectors)
        for (i = 0; i < points.length; i++)
            if (!geo.exclusiveBetween(Math.atan2(base.map[i].y - target.y, base.map[i].x - target.x),
                                      base.map[i].lAngle, base.map[i].rAngle) &&
                !geo.exclusiveBetween(Math.atan2(target.y - base.map[i].y, target.x - base.map[i].x),
                                      base.map[i].lAngle, base.map[i].rAngle) &&
                geo.linePolygonsIntersect(target, base.map[i], base.polygons) === false) {

                points[i].endInSight = true;
                points[i].polygon.endVisible = true;
            }

        var count = 0;
        //Loop through our tree until it is empty or until we reach our target
        while (tree.heap.length > 1 && !tree.heap[1].endInSight && count < 10000) {
            count++;
            //Grab the top
            top = tree.pop();

            //It is unlikely this is ever needed, but I have yet to see a proof
            //top.inside = false;

            //Loop through all nodes our current path can link to
            for (i = 0; i < top.nodes.length; i++)

                //If our new test path is shorter than what it was before, replace it
                //  Note: we start out infinity, but we could reach these nodes from a longer path
                if (points[top.nodes[i][0].id].dist > top.dist + top.nodes[i][1]) {

                    if (points[top.nodes[i][0].id].prev === null)
                        points[top.nodes[i][0].id].polygon.pCount--;

                    //Set dist and prev
                    points[top.nodes[i][0].id].dist = top.dist + top.nodes[i][1];
                    points[top.nodes[i][0].id].prev = top;

                    //Add it to the point list
                    //  Note: we /want/ to recheck it if we've reached it before
                    if (!points[top.nodes[i][0].id].inside)
                        tree.push(points[top.nodes[i][0].id]);
                    //else
                    //    tree.decreaseKey(points[top.nodes[i][0].id].pos);

                    //Mark it as being in the tree
                    points[top.nodes[i][0].id].inside = true;
                }
        }

        //Our tree is empty, meaning target is disconnected; get nearestPoint and pathfind to it
        if (tree.heap.length === 1) {

            //Will hold a list of polygons we only partially reached
            partialPolygons = [];

            //Fill the polygon with partials
            for (i = 0; i < base.polygons.length; i++)
                if (base.polygons[i].pCount > 0 && base.polygons[i].endVisible)
                    partialPolygons.push(base.polygons[i]);

            //Grab a new target; remove holes
            partialPolygons = geo.mergePolygons(partialPolygons);

            for (i = 0; i < partialPolygons.length; i++)
                for (n = 0; n < partialPolygons.length; n++)
                    if (i !== n && geo.pointInPolygon(partialPolygons[n][0], partialPolygons[i]))
                        partialPolygons.splice(n--, 1);

            if (partialPolygons.length === 1)
                partialPolygons = partialPolygons[0];

            //Grow the polygon to include siblings
            if (partialPolygons[0].x === "undefined")
                partialPolygons = geo.growPolygons(partialPolygons, base.polygons);
            else
                partialPolygons = geo.growPolygon(partialPolygons, base.polygons);

            if (partialPolygons[0].x === "undefined")
                for (i = 0; i < partialPolygons.length; i++)
                    for (n = 0; n < partialPolygons.length; n++)
                        if (i !== n && geo.pointInPolygon(partialPolygons[n][0], partialPolygons[i]))
                            partialPolygons.splice(n--, 1);


            //Grab the new target
            //if (partialPolygons[0].x === "undefined")
            //    target = geo.nearestPoint(target, base.polygons, partialPolygons[0]);
            //else
            //    target = geo.nearestPoint(target, base.polygons, partialPolygons);

            //And recurse! (NOTE: multiple recursions will get you far from the original target)
            return this.path(object, target, partialPolygons);

        }

        //We reached it; use target and set path to reaching target
        cur = tree.heap[1];
        path = [target, cur.point];

        //Build the path backwards
        while (cur.prev) path.push((cur = cur.prev).point);

        //Return it (in reverse order...)
		return path;*/

    };

    window.NavMesh = NavMesh;
    window.cpr = cpr;
    window.subtract = subtract;
    window.lPoint = lPoint;
    window.rPoint = rPoint;

}(window));
