
(function (window) {
    "use strict";
    
    var ClipperLib = window.ClipperLib,
        Geo = window.Geo,
        PriorityQueue = window.PriorityQueue,
        RecentArray = window.RecentArray,
        DQuadTree = window.DQuadTree,
        
        Drawing = window.Drawing,
        
        getPoint = window.getPoint,
        getPair = window.getPair,
        
        earcut = window.earcut,
        
        co = new ClipperLib.ClipperOffset(2, 0.25),
        cpr = new ClipperLib.Clipper();
    
    function pointToCell(base, point) {
        
        var query = base.quadtree.queryPoint(point.x, point.y, point.radius || 0),
            
            result;
        
        return query;
        
        //console.log(query);
        
        
        
        /* jshint -W084 */
        /*while (result = query.next().result) {
            
            console.log(result);
            
        }*/
        
    }
    
    function distanceBetweenPoints(a, b) {
        return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
    }
    
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
        this.quadtree = new DQuadTree(32, null, {x: bounds[0], y: bounds[1]}, {x: bounds[2], y: bounds[5]});
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
    
    Base.prototype.meshIntersectRough = function(polygon) {
        
        var query = this.quadtree.queryRange(polygon.min.x, polygon.min.y,
                                             polygon.max.x, polygon.max.y, polygon.radius),
            
            meshes = [],
            
            result;
        
        /* jshint -W084 */
        while (result = query.next().value)
            meshes = meshes.concat(result);
        
        return meshes;
        
    };
    
    Base.prototype.meshIntersectRoughMultiple = function(polygons) {
        
        var meshes = [],
            
            i;
        
        for (i = 0; i < polygons.length; i++)
            meshes = meshes.concat(this.meshIntersectRough(polygons[i]));
        
        return meshes;
        
    };
    
    Base.prototype.testExisting = function () {
        
    };
    
    Base.prototype.addSegment = function (a, b) {
        
    };
    
    Base.prototype.mergeNewPolygons = function () {
        
    };
    
    Base.prototype.polygonOrientation = function (object) {
        
        var distance,
            
            i,
            
            polygon = new ClipperLib.Paths();
        
        co.Clear();
        co.AddPath(object, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);
        co.Execute(polygon, this.radius);
        
        polygon = polygon[0];
        
        reformPolygon(polygon);
        
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
    
    Base.prototype.dropPolygon = function (polygon) {
        
        
        
    };
    
    function addTriangleToSegment(a, b, triangle) {
        
        var pair = getPair(a, b);
        
        a.segments.add(pair);
        b.segments.add(pair);
        
        if (pair.cells.push(triangle) > 1) {
            //console.log(a.lefts.get(
            console.log(pair.cells);
        }
        
        return pair;
    }
    
    var FIRST = true;
    
    function clip(parent, holes) {
        
        var list = [], indicies = [],
            
            trianglesRaw, triangles = [],
            
            a, b, c, triangle,
            
            i, n;
        
        for (i = 0; i < parent.length; i++) {
            list.push(parent[i].x);
            list.push(parent[i].y);
        }
        
        for (i = 0; i < holes.length; i++) {
            indicies.push(list.length / 2);
            for (n = 0; n < holes[i].length; n++) {
                list.push(holes[i][n].x);
                list.push(holes[i][n].y);
            }
        }
        
        trianglesRaw = earcut(list, indicies);
        
        for (i = 0; i < trianglesRaw.length; i += 3) {
            
            a = getPoint(list[trianglesRaw[i] * 2], list[trianglesRaw[i] * 2 + 1]);
            b = getPoint(list[trianglesRaw[i + 1] * 2], list[trianglesRaw[i + 1] * 2 + 1]);
            c = getPoint(list[trianglesRaw[i + 2] * 2], list[trianglesRaw[i + 2] * 2 + 1]);
            
            triangle = [a, b, c];
            
            a.lefts.set(triangle, b);
            b.lefts.set(triangle, c);
            c.lefts.set(triangle, a);
            
            a.rights.set(triangle, c);
            b.rights.set(triangle, a);
            c.rights.set(triangle, b);
            
            a.cells.push(triangle);
            b.cells.push(triangle);
            c.cells.push(triangle);
            
            addTriangleToSegment(a, b, triangle);
            addTriangleToSegment(b, c, triangle);
            addTriangleToSegment(c, a, triangle);
            
            triangles.push(triangle);
            
            new Drawing.Path(triangle).close().append().draw();
        }
        
        console.log(triangles);
        
        //narrowMerge(list);
        
    }
    
    Base.prototype.update = function () {
        
        var oldLength, newPolygons, affectedMeshes,
            
            clippedMesh = [], holes, parent,
            
            i, n;
        
        //Only bother if there are some statics to remove
        if (this.deadStatics.length > 0) {
            
            
            
            //this.deadPolygons = [];
            //this.deadStatics = [];
        }
        
        //Only bother if there are some new static objects
        if (this.newStatics.length > 0) {
            
            oldLength = this.polygons.length;
            
            //Add new; block existing
            for (i = 0; i < this.newStatics.length; i++)
                this.polygonOrientation(this.newStatics[i]);
            
            newPolygons = this.polygons.slice(oldLength);
            
            affectedMeshes = this.meshIntersectRoughMultiple(newPolygons);
            
            cpr.Clear();
            cpr.AddPaths(affectedMeshes, ClipperLib.PolyType.ptSubject, true);
            cpr.AddPaths(newPolygons, ClipperLib.PolyType.ptClip, true);
            
            cpr.Execute(ClipperLib.ClipType.ctDifference, clippedMesh,
                        ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
            
            for (i = 0; i < clippedMesh.length; i++) {
                
                if (Geo.orientation(clippedMesh[i][0], clippedMesh[i][1], clippedMesh[i][2]) === 2) {
                    
                    //CALC PREVIOUS
                    if (parent) clip(parent, holes);
                    
                    parent = clippedMesh[i];
                    holes = [];
                    
                } else
                    
                    holes.push(clippedMesh[i]);
                
            }
            
            clip(parent, holes);
            
            /*for (i = 0; i < clippedMesh.length; i++) {
                reformPolygon(clippedMesh[i]);
                new Drawing.Path(clippedMesh[i]).close().append().draw();
            }*/
            
            //console.log(clippedMesh);
            
            //And we have no more new statisc!
            //this.newPolygons = [];
            //this.newStatics = [];
            
        }
        
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
    window.pointToCell = pointToCell;
    
}(window));
