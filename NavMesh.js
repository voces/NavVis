//https://i.imgur.com/1mOPJAe.png
(function (window) {
    "use strict";
    
    var ClipperLib = window.ClipperLib,
        Geo = window.Geo,
        //PriorityQueue = window.PriorityQueue,
        //RecentArray = window.RecentArray,
        DQuadTree = window.DQuadTree,
        
        Drawing = window.Drawing,
        
        Color = window.Color,
        
        getPoint = window.getPoint,
        getPair = window.getPair,
        dropPair = window.dropPair,
        
        earcut = window.earcut,
        
        co = new ClipperLib.ClipperOffset(2, 0.25),
        cpr = new ClipperLib.Clipper();
    
    var curId = 0;
    
    /*function distanceBetweenPoints(a, b) {
        return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
    }*/
    
    function reformPolygon(polygon) {
        
        var i;
        
        for (i = 0; i < polygon.length; i++)
            polygon[i] = getPoint(polygon[i].x, polygon[i].y);
        
    }
    
    function calcPolygonStats(polygon) {
        
        var distance,
            
            i;
        
        //Initialize the polygon's min and max
        polygon.min = {x: Infinity, y: Infinity};
        polygon.max = {x: -Infinity, y: -Infinity};
        
        //For calculating the center
        polygon.x = polygon.y = 0;
        
        for (i = 0; i < polygon.length; i++) {
            
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
        for (i = 0; i < polygon.length; i++) {
            distance = Geo.distanceBetweenPoints(polygon, polygon[i]);
            if (distance > polygon.radius) polygon.radius = distance;
        }
        
    }
    
    function Base(navmesh, radius, newStatics) {
        
        var bounds,
            
            i;
        
        this.navmesh = navmesh;
        
        
        //The radius this base is using
        this.radius = radius;
        
        //A list of all nodes in the (active) graph
        this.graph = [];
        
        //A list of static polygons (all dynamics are grabbed from .pathing.dynamics)
        this.polygons = [];
        
        //A list of recently added polygons that have not been calculated yet
        this.newStatics = [];
        for (i = 0; i < newStatics.length; i++) this.newStatics.push(newStatics[i]);
        
        //A list of recently removed polygons that have not been calculated yet and
        //  it's associated table (possibly removed by updating)
        this.deadStatics = [];
        
        //A list of all concave polygons in the graph (inverted space from this.polygons)
        
        bounds = this.generateBounds();
        
        //bounds.x = (bounds[0] + bounds[2]) / 2;
        //bounds.y = (bounds[1] + bounds[5]) / 2;
        //bounds.radius = distanceBetweenPoints({x: bounds[0], y: bounds[1]}, bounds);
        
        this.mesh = [bounds];
        this.quadtree = new DQuadTree(32, null, bounds[0], bounds[2]);
        this.quadtree.push(bounds);
        
    }
    
    Base.prototype.generateBounds = function() {
        
        var polygon = [
            getPoint(this.navmesh.minX + this.radius, this.navmesh.minY + this.radius),
            getPoint(this.navmesh.maxX - this.radius, this.navmesh.minY + this.radius),
            getPoint(this.navmesh.maxX - this.radius, this.navmesh.maxY - this.radius),
            getPoint(this.navmesh.minX + this.radius, this.navmesh.maxY - this.radius)
        ];
        
        calcPolygonStats(polygon);
        
        return polygon;
        
    };
    
    Base.prototype.meshIntersectRough = function(polygon, check) {
        
        //A generator that returns one cell at a time
        var query = this.quadtree.queryRange(polygon.min.x, polygon.min.y,
                                             polygon.max.x, polygon.max.y, polygon.radius),
            
            meshes = [],
            
            result,
            
            i;
        
        //Grab the next cell of meshes (occurs due to MeshIntersectRoughMultiple)
        while (result = query.next().value)
            
            //Ignore cells we've already hit
            if (result._meshIntersectRoughCheck !== check) {
                
                //Loop through each mesh
                for (i = 0; i < result.length; i++)
                    
                    //Ignore meshes we've already hit
                    if (result[i]._meshIntersectRoughCheck !== check) {
                        
                        //Add and mark the mesh
                        meshes.push(result[i]);
                        result[i]._meshIntersectRoughCheck = check;
                    }
                
                //Mark the cell
                result._meshIntersectRoughCheck = check;
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
    
    Base.prototype.meshIntersectMultiple = function(polygons) {
        
        var meshes = [],
            
            i;
        
        //Loop through each polygon, adding cells/meshes one at a time
        for (i = 0; i < polygons.length; i++)
            meshes = meshes.concat(
                this.meshIntersectRough(polygons[i], Base.prototype.meshIntersectMultiple.checks)
                .filter(doPolygonsIntersect, {polygon: polygons[i]}));
        
        //Inc our checker
        this.meshIntersectMultiple.checks++;
        
        return meshes;
        
    };
    
    Base.prototype.meshIntersectMultiple.checks = 0;
    
    Base.prototype.testExisting = function () {
        
    };
    
    Base.prototype.mergeNewPolygons = function () {
        
    };
    
    Base.prototype.polygonOrientation = function (object) {
        
        var distance,
            
            i,
            
            tPolygon = new ClipperLib.Paths(), polygon;
        
        co.Clear();
        co.AddPath(object, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);
        co.Execute(tPolygon, this.radius);
        
        polygon = tPolygon[0];
        polygon.holes = tPolygon.slice(1);
        
        reformPolygon(polygon);
        for (i = 0; i < polygon.holes.length; i++)
            reformPolygon(polygon.holes[i]);
        
        //Initialize the polygon's min and max
        polygon.min = {x: Infinity, y: Infinity};
        polygon.max = {x: -Infinity, y: -Infinity};
        
        //For calculating the center
        polygon.x = polygon.y = 0;
        
        for (i = 0; i < polygon.length; i++) {
            
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
        for (i = 0; i < polygon.length; i++) {
            distance = Geo.distanceBetweenPoints(polygon, polygon[i]);
            if (distance > polygon.radius) polygon.radius = distance;
        }
        
        //Push the polygon into both the polygon and newpolygon list
        this.polygons.push(polygon);
        //this.newPolygons.push(polygon);
        
        //Add a reference from the original object to the polygon
        object[this.navmesh.id].polygons[this.radius] = polygon;
        
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
        var left, right, arr = [];
        
        for (left = 0, right = array.length - 1; left < right; left++, right--) {
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
        
        var aStart, aEnd,
            bStart, bEnd,
            
            aDirection,
            bDirection,
            
            arr,
            
            i;
        
        //Find start/end in a
        for (i = 0; i < a.length; i++)
            if (a[i] === start) {
                aStart = i;
                if (typeof aEnd !== "undefined") break;
            } else if (a[i] === end) {
                aEnd = i;
                if (typeof aStart !== "undefined") break;
            }
        
        //Find start/end in b
        for (i = 0; i < b.length; i++)
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
            bDirection != bDirection;
            
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
        for (i = 0; i < arr.length; i++)
            if (Geo.orientation(arr[i ? i - 1 : arr.length - 1], arr[(i + 1) % arr.length], arr[i]) === 0) {
                arr.splice(i, 1);
                i--;
            }
        
        replaceArrayContents(a, arr);
        
        return a;
        
    }
    
    /*function angleBetweenPoints(a, b, c) {
        return Math.atan2(b.y - a.y, b.x - a.x) - Math.atan2(c.y - a.y, c.x - a.x);
    }*/
    
    function right(polygon, point) {
        return polygon[(polygon.indexOf(point) + 1) % polygon.length];
    }
    
    function left(polygon, point) {
        return polygon[(polygon.indexOf(point) || polygon.length) - 1];
    }
    
    function convexTest(pointA, pointB, edge) {
        
        /*console.log("\t\t\t", goingLeft(edge.cells[0].indexOf(pointA), edge.cells[0].indexOf(pointB), edge.cells[0].length),
                    goingLeft(edge.cells[1].indexOf(pointA), edge.cells[1].indexOf(pointB), edge.cells[1].length));*/
        
        if (goingLeft(edge.cells[0].indexOf(pointA), edge.cells[0].indexOf(pointB), edge.cells[0].length))
            
            if (goingLeft(edge.cells[1].indexOf(pointA), edge.cells[1].indexOf(pointB), edge.cells[1].length)) {
                /*console.log("\t\t\t", "tt",
                        right(edge.cells[0], pointA).toString(), left(edge.cells[1], pointA.toString()), pointA.toString(),
                        Geo.orientation(right(edge.cells[0], pointA), left(edge.cells[1], pointA), pointA));
                console.log("\t\t\t", "tt",
                        right(edge.cells[1], pointB).toString(), left(edge.cells[0], pointB.toString()), pointB.toString(),
                        Geo.orientation(right(edge.cells[1], pointB), left(edge.cells[0], pointB), pointB));*/
            
                return (Geo.orientation(right(edge.cells[0], pointA), left(edge.cells[1], pointA), pointA) !== 1 &&
                        Geo.orientation(right(edge.cells[1], pointB), left(edge.cells[0], pointB), pointB) !== 1);
            }
        
            else {
                /*console.log("\t\t\t", "tf",
                        right(edge.cells[0], pointA).toString(), left(edge.cells[1], pointA).toString(), pointA.toString(),
                        Geo.orientation(right(edge.cells[0], pointA), left(edge.cells[1], pointA), pointA));
                console.log("\t\t\t", "tf",
                            right(edge.cells[1], pointB).toString(), left(edge.cells[0], pointB).toString(), pointB.toString(),
                            Geo.orientation(right(edge.cells[1], pointB), left(edge.cells[0], pointB), pointB));*/

                return (Geo.orientation(right(edge.cells[0], pointA), left(edge.cells[1], pointA), pointA) !== 1 &&
                        Geo.orientation(right(edge.cells[1], pointB), left(edge.cells[0], pointB), pointB) !== 1);
            }
        
        else if (goingLeft(edge.cells[1].indexOf(pointA), edge.cells[1].indexOf(pointB), edge.cells[1].length)) {
            /*console.log(edge.cells[1].indexOf(pointA), (edge.cells[1].indexOf(pointA) + 1) % edge.cells[1].length);
            console.log("\t\t\t", "ft",
                        right(edge.cells[1], pointA).toString(), left(edge.cells[0], pointA).toString(), pointA.toString(),
                        Geo.orientation(right(edge.cells[1], pointA), left(edge.cells[0], pointA), pointA));
            console.log("\t\t\t", "ft",
                        right(edge.cells[0], pointB).toString(), left(edge.cells[1], pointB).toString(), pointB.toString(),
                        Geo.orientation(right(edge.cells[0], pointB), left(edge.cells[1], pointB), pointB));*/

            return (Geo.orientation(right(edge.cells[1], pointA), left(edge.cells[0], pointA), pointA) !== 1 &&
                    Geo.orientation(right(edge.cells[0], pointB), left(edge.cells[1], pointB), pointB) !== 1);
        }
        
        else {
            /*console.log("\t\t\t", "ff",
                        right(edge.cells[0], pointA).toString(), left(edge.cells[1], pointA).toString(), pointA.toString(),
                        Geo.orientation(right(edge.cells[0], pointA), left(edge.cells[1], pointA), pointA));
            console.log("\t\t\t", "ff",
                        right(edge.cells[1], pointB).toString(), left(edge.cells[0], pointB).toString(), pointB.toString(),
                        Geo.orientation(right(edge.cells[1], pointB), left(edge.cells[0], pointB), pointB));*/

            return (Geo.orientation(right(edge.cells[0], pointA), left(edge.cells[1], pointA), pointA) !== 1 &&
                    Geo.orientation(right(edge.cells[1], pointB), left(edge.cells[0], pointB), pointB) !== 1);
        }
        
    }
    
    Base.prototype.mergeInPolygon = function(polygon, polygons, noAdd) {
        
        var addPolygon = true,
            
            pointA, pointB,
            
            vertices = polygon.slice(0),
            
            edge, tEdge,
            
            i, n;
        
        for (i = 0; i < vertices.length; i++) {
            
            //For easy access of each end point of the edge
            pointA = vertices[i];
            pointB = vertices[(i + 1) % vertices.length];
            
            //The edge (edge)
            edge = getPair(pointA, pointB);
            
            /*console.log("\t", "test", pointA.toString(), pointB.toString());
            if (edge.cells[0]) console.log("\t\t", edge.cells[0].id, edge.cells[0].colorName);*/
            
            //Push the triangle into the polygons that use the pair (edge), check if we now have both sides of said
            //  edge
            if ((noAdd && edge.cells.length === 2) || (!noAdd && edge.cells.push(polygon) === 2)) {
                
                //console.log("\t\t", edge.cells[1].id, edge.cells[1].colorName);
                
                //Check to see if we can add the polygons that share the edge together (simple 180 angle testing)
                if (convexTest(pointA, pointB, edge)) {
                    
                    //console.log("\t", edge.cells[1].id, edge.cells[1].colorName, "==>", edge.cells[0].id, edge.cells[0].colorName);
                    
                    //console.log(pointListToString(edge.cells[0]));
                    //Merge the polygons; pair.cells[0] is automatically updated (triangle is essentially set to it)
                    polygon = mergeSimple(edge.cells[0], edge.cells[1], pointA, pointB);
                    //console.log(pointListToString(edge.cells[0]));
                    
                    //Loop through the points that make up the new cell
                    for (n = 0; n < edge.cells[1].length; n++) {
                        
                        //Create new lefts for the points relative to the primary cell
                        if (edge.cells[1][n] !== pointA)
                            edge.cells[1][n].lefts.set(polygon, edge.cells[1][n].lefts.get(edge.cells[1]));
                        
                        //Create new rights for the points relative to the primary cell
                        if (edge.cells[1][n] !== pointB)
                            edge.cells[1][n].rights.set(polygon, edge.cells[1][n].rights.get(edge.cells[1]));
                        
                        //Delete lefts/rights for the points relative to the secondary cell
                        if (edge.cells[1] !== polygon) {
                            edge.cells[1][n].lefts.delete(edge.cells[1]);
                            edge.cells[1][n].rights.delete(edge.cells[1]);
                        }
                        
                    }
                    
                    //Loop through the points that make up the new cell
                    for (n = 0; n < edge.cells[1].length; n++) {
                        
                        //Grab an edge of the point
                        tEdge = getPair(edge.cells[1][n], edge.cells[1][(n + 1) % edge.cells[1].length]);
                        
                        //Skip if we're working on the dying edge
                        if (edge === tEdge) continue;
                        
                        if (tEdge.cells[0] === edge.cells[1]) tEdge.cells[0] = polygon;
                        
                        if (tEdge.cells[1] === edge.cells[1]) tEdge.cells[1] = polygon;
                        
                    }
                    
                    //The active triangle we're working on was already added to another, meaning we are actually
                    //  doing a second merging, meaning we're merging two existing polygons... so remove one
                    //if (!addPolygon) console.log("\t", "removing", polygons.splice(polygons.indexOf(edge.cells[1]), 1)[0]);
                    if (!addPolygon) polygons.splice(polygons.indexOf(edge.cells[1]), 1);
                    
                    //The edge was merged into two other polygons; drop it
                    dropPair(edge);
                    
                    //Since the triangle was merged with an existing one, don't add it
                    addPolygon = false;
                    
                }
                
            }
            
            //console.log(edge, edge.cells.length);
            
        }
        
        //If the polygon was merged previously and not merged this time, update it and be done
        if (noAdd && addPolygon) {
            
            if (typeof polygon[this.quadtree.id] !== "undefined") {
                this.quadtree.remove(polygon);
                calcPolygonStats(polygon);
                this.quadtree.push(polygon);
            }
            
        //If the polygon was not merged
        } else if (addPolygon) {
            
            //If the polygon was not merged previously, add it to the list and be done
            if (!noAdd) polygons.push(polygon);
            
            //If the polygon was merged previously, update it and be done
            else if (typeof polygon[this.quadtree.id] !== "undefined") {
                this.quadtree.remove(polygon);
                calcPolygonStats(polygon);
                this.quadtree.push(polygon);
            }
            
        //If the polygon was merged
        } else this.mergeInPolygon(polygon, polygons, true);
        
    };
    
    Base.prototype.clip = function(parent, holes) {
        
        var list = [], indicies = [],
            
            trianglesRaw, polygons = [],
            
            a, b, c, triangle,
            
            color,
            
            i, n;
        
        //Push all parents onto the list first
        for (i = 0; i < parent.length; i++) {
            list.push(parent[i].x);
            list.push(parent[i].y);
        }
        
        //Get the current index in list, push to holes, then push to list
        for (i = 0; i < holes.length; i++) {
            indicies.push(list.length / 2);
            for (n = 0; n < holes[i].length; n++) {
                list.push(holes[i][n].x);
                list.push(holes[i][n].y);
            }
        }
        
        //Get the raw triangles from ear cut
        trianglesRaw = earcut(list, indicies);
        
        //Loop through all raw triangles
        for (i = 0; i < trianglesRaw.length; i += 3) {
            
            //Get the three points of each triangle
            a = getPoint(list[trianglesRaw[i] * 2], list[trianglesRaw[i] * 2 + 1]);
            b = getPoint(list[trianglesRaw[i + 1] * 2], list[trianglesRaw[i + 1] * 2 + 1]);
            c = getPoint(list[trianglesRaw[i + 2] * 2], list[trianglesRaw[i + 2] * 2 + 1]);
            
            //Build it
            triangle = [a, b, c];
            
            //Fill in the "left" point of each triangle (from looking outside)
            a.lefts.set(triangle, b);
            b.lefts.set(triangle, c);
            c.lefts.set(triangle, a);
            
            //Fill in the "right" point of each triangle (from looking outside)
            a.rights.set(triangle, c);
            b.rights.set(triangle, a);
            c.rights.set(triangle, b);
            
            triangle.id = curId++;
            
            color = Color.indexColor(triangle.id);
            
            triangle.colorName = color[0];
            triangle.color = color[1];
            
            //console.log(triangle.id, triangle.colorName, a.toString(), b.toString(), c.toString());
            
            new Drawing.Path(triangle).fill(triangle.color).close().width(0).append().draw().temp();
            
            /*for (n = 0; n < polygons.length; n++)
                console.log("\t", polygons[n].id, polygons[n].colorName);*/
            
            //Merge in the new triangle
            this.mergeInPolygon(triangle, polygons);
            
            /*for (n = 0; n < polygons.length; n++)
                console.log("\t", polygons[n].id, polygons[n].colorName);*/
            
        }
        
        return polygons;
        
    };
    
    Base.prototype.update = function () {
        
        //console.log("");
        
        Drawing.clearTemp();
        
        var oldLength, newPolygons, affectedMeshes,
            
            clippedMesh = [], holes = [], parent,
            newMesh,
            
            index, tPair,
            
            i, n;
        
        //Only bother if there are some statics to remove
        if (this.deadStatics.length > 0) {
            
            //this.deadPolygons = [];
            //this.deadStatics = [];
        }
        
        //Only bother if there are some new static objects
        if (this.newStatics.length > 0) {
            
            //Store the old length
            oldLength = this.polygons.length;
            
            //Add new; block existing
            for (i = 0; i < this.newStatics.length; i++)
                this.polygonOrientation(this.newStatics[i]);
            
            //Grab the polygons just added
            newPolygons = this.polygons.slice(oldLength);
            
            //Grab the meshes's we're going to be working on
            //  TODO: this should be reduced to interesecting polygons (such test is probably cheaper than rebuilding
            //        paths)
            affectedMeshes = this.meshIntersectMultiple(newPolygons);
            
            //Loop through all affected meshes
            for (i = 0; i < affectedMeshes.length; i++) {
                
                //console.log("remove", affectedMeshes[i].id, affectedMeshes[i].colorName);
                
                //Remove the mesh from the quadtree
                this.quadtree.remove(affectedMeshes[i]);
                
                //Loop through all points on the mesh
                for (n = 0; n < affectedMeshes[i].length; n++) {
                    
                    //Remove the mesh from the point's cells list
                    index = affectedMeshes[i][n].cells.indexOf(affectedMeshes[i]);
                    if (index >= 0) affectedMeshes[i][n].cells.splice(index, 1);
                    
                    //Grab the pair between the point and the next point
                    tPair = getPair(affectedMeshes[i][n], affectedMeshes[i][(n + 1) % affectedMeshes[i].length]);
                    
                    //Remove the mesh from the pair's cells list
                    index = tPair.cells.indexOf(affectedMeshes[i]);
                    if (index >= 0) tPair.cells.splice(index, 1);
                    
                    //Remove the lefts/rights associated with the mesh from the point
                    affectedMeshes[i][n].lefts.delete(affectedMeshes[i]);
                    affectedMeshes[i][n].rights.delete(affectedMeshes[i]);
                }
                
            }
            
            //Subtract the new polygons from the old mesh; store it in clippedMesh
            cpr.Clear();
            cpr.AddPaths(affectedMeshes, ClipperLib.PolyType.ptSubject, true);
            cpr.AddPaths(newPolygons, ClipperLib.PolyType.ptClip, true);
            for (i = 0; i < newPolygons.length; i++)
                cpr.AddPaths(newPolygons[i].holes, ClipperLib.PolyType.ptClip, true);
            cpr.Execute(ClipperLib.ClipType.ctDifference, clippedMesh,
                        ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
            
            //Loop through all the returned meshes; clip them one at a time
            for (i = 0; i < clippedMesh.length; i++)
                
                //Not a hole
                if (ClipperLib.Clipper.Orientation(clippedMesh[i])) {
                    
                    //Calculate the previous
                    if (parent) {
                        //console.log(parent);
                        
                        newMesh = this.clip(parent, holes);
                        
                        //console.log("update0", newMesh);
                        
                        console.log(newMesh, newMesh.length);
                        for (n = 0; n < newMesh.length; n++)
                            console.log(newMesh[n]);
                        
                        for (n = 0; n < newMesh.length; n++) {
                            //console.log("\t", "push", newMesh[n].id, newMesh[n].colorName);
                            
                            if (typeof newMesh[n] === "undefined")
                                console.error("Missing newMesh?", newMesh, n, newMesh[n]);
                            
                            calcPolygonStats(newMesh[n]);
                            this.quadtree.push(newMesh[n]);
                        }
                        
                    }
                    
                    parent = clippedMesh[i];
                    holes = [];
                    
                //A hole, just add to list and continue
                } else holes.push(clippedMesh[i]);
             
            //console.log(parent);
            
            //Clip in the last parent
            newMesh = this.clip(parent, holes);
            
            //console.log("update1", newMesh);
            
            for (i = 0; i < newMesh.length; i++) {
                
                if (typeof newMesh[i] === "undefined")
                    console.error("Missing newMesh?", newMesh, i, newMesh[i]);
                
                calcPolygonStats(newMesh[i]);
                this.quadtree.push(newMesh[i]);
            }
            
            this.newStatics = [];
            
        }
        
        affectedMeshes = this.meshIntersectMultiple([
            {min: {x: 0, y: 0}, max: {x: window.innerWidth, y: window.innerHeight}, radius: 0}]);
        
        //For display purposes, draw all the triangles
        for (i = 0; i < affectedMeshes.length; i++)
            new Drawing.Path(affectedMeshes[i]).fill("none").close().width(5).append().draw().temp();
        
        //alert();
        Drawing.clearTemp(); this.quadtree.drawAll();
        
    };
    
    var navmeshId = 0;
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
        
        var i;
        
        //Quit if already added
        if (typeof polygon[this.id] === "object")
            return;
        
        //Push it
        this.statics.push(polygon);
        
        //Attach data
        polygon[this.id] = {
            isStatic: true,
            polygons: [],
            basesStati: []
        };
        
        //Loop through bases to add/remove...
        for (i = 0; i < this.bases.length; i++)
            
            //Add it
            this.bases[i].newStatics.push(polygon);
            
    };
    
    /**
     * Removes a static object
     * @param {object} object - An object or an index of said object
     */
    NavMesh.prototype.removeStatic = function (polygon) {
        
        var i;
        
        //Remove from the list of statics
        this.statics.splice(this.statics.indexOf(polygon), 1);
        
        //Remove from bases
        for (i = 0; i < this.bases.length; i++) {
            
            //Not yet added
            if (polygon.basesStati[i] === undefined)
            
                //Remove from any new statics
                this.bases[i].newStatics.splice(this.bases[i].newStatics.indexOf(polygon), 1);
            
            //Not yet marked for removal
            else if (polygon.baseStati[i] !== 2) {
                
                this.bases[i].deadStatics.push(polygon);
                polygon.baseStati[i] = 2;
                
            }
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
        
        var base/*,
            
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
        target = Geo.nearestPoint(target, base.polygons, partialPolygons);
        //if (Geo.pointInPolygons(target, base.polygons) || Geo.pointInPolygons(object, base.polygons))
        //    return false;
        
        //Directly possible
        if (object.x === target.x && object.y === target.y)
            return [object];
        else if (Geo.linePolygonsIntersect(object, target, base.polygons) === false)
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
                distToEnd: Geo.distanceBetweenPoints(target, base.map[i]),
                nodes: base.map[i].nodes,
                point: {
                    x: base.map[i].x,
                    y: base.map[i].y
                },
                polygon: base.map[i].polygon
            }) - 1;
            
            points[n].polygon.pCount++;
            
            //Immediately visible points; set prev and distance
            if (!Geo.exclusiveBetween(Math.atan2(base.map[i].y - object.y, base.map[i].x - object.x),
                                      base.map[i].lAngle, base.map[i].rAngle) &&
                !Geo.exclusiveBetween(Math.atan2(object.y - base.map[i].y, object.x - base.map[i].x),
                                      base.map[i].lAngle, base.map[i].rAngle) &&
                Geo.linePolygonsIntersect(object, base.map[i], base.polygons) === false) {
                
                points[n].prev = start;
                points[n].dist = Geo.distanceBetweenPoints(object, base.map[i]);
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
            if (!Geo.exclusiveBetween(Math.atan2(base.map[i].y - target.y, base.map[i].x - target.x),
                                      base.map[i].lAngle, base.map[i].rAngle) &&
                !Geo.exclusiveBetween(Math.atan2(target.y - base.map[i].y, target.x - base.map[i].x),
                                      base.map[i].lAngle, base.map[i].rAngle) &&
                Geo.linePolygonsIntersect(target, base.map[i], base.polygons) === false) {
                
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
            partialPolygons = Geo.mergePolygons(partialPolygons);
            
            for (i = 0; i < partialPolygons.length; i++)
                for (n = 0; n < partialPolygons.length; n++)
                    if (i !== n && Geo.pointInPolygon(partialPolygons[n][0], partialPolygons[i]))
                        partialPolygons.splice(n--, 1);
            
            if (partialPolygons.length === 1)
                partialPolygons = partialPolygons[0];
            
            //Grow the polygon to include siblings
            if (partialPolygons[0].x === "undefined")
                partialPolygons = Geo.growPolygons(partialPolygons, base.polygons);
            else
                partialPolygons = Geo.growPolygon(partialPolygons, base.polygons);
            
            if (partialPolygons[0].x === "undefined")
                for (i = 0; i < partialPolygons.length; i++)
                    for (n = 0; n < partialPolygons.length; n++)
                        if (i !== n && Geo.pointInPolygon(partialPolygons[n][0], partialPolygons[i]))
                            partialPolygons.splice(n--, 1);
            
            
            //Grab the new target
            //if (partialPolygons[0].x === "undefined")
            //    target = Geo.nearestPoint(target, base.polygons, partialPolygons[0]);
            //else
            //    target = Geo.nearestPoint(target, base.polygons, partialPolygons);
            
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
    
}(window));
