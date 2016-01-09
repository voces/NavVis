
(function (window) {
    "use strict";

    let geo = window.geo,
        ReversibleMap = window.ReversibleMap,
        Angle = window.Angle;

    class EventSet extends Set {

        constructor(container) {

            super();

            this.onAdd = new Set();
            this.onDelete = new Set();
            this.onEmpty = new Set();

            this.container = container;

        }

        add(value) {

            super.add(value);

            for (let callback of this.onAdd)
                callback(value, this.container);

        }

        delete(value) {

            super.delete(value);

            for (let callback of this.onDelete)
                callback(value, this.container);

            if (this.size === 0)
                for (let callback of this.onEmpty)
                    callback(value, this.container);

        }

    }

    function angleBetweenPoints(a, b) {
        return Math.atan2(b.y - a.y, b.x - a.x);
    }

    function rPoint(polygon, point) {
        return polygon[(polygon.indexOf(point) + 1) % polygon.length];
    }

    function lPoint(polygon, point) {
        return polygon[(polygon.indexOf(point) || polygon.length) - 1];
    }

    class Point {

        constructor(x, y) {

            //Primary attributes of the point
            this.x = x;
            this.y = y;

            //Obstacles (polygons) that block walkability
            this.obstacles = new EventSet(this);
            this.obstacleSlices = new Map();

            //Default internal (such as corners of the navigational mesh)
            //  A point is external if for any obstacle it is an external point (i.e., the exterior angle is > 180)
            this.external = false;

            //Polygon statics (blocking regions) that use the point
            this.polygons = new EventSet(this);

            //Polygons within the mesh that use the point
            this.cells = [];

            //I forget what this is for...
            this.segments = new Set();

            //Edges that use this point
            this.edges = new EventSet(this);

            //Points we've tested in terms of visiblity and have passed
            this.visiblePoints = new Set();

            this.visibility = new ReversibleMap();
            this.slices = new Map();

            // this.polygons.onAdd.add(this.onAdd.bind(this));
            // this.polygons.onDelete.add(this.onDelete.bind(this));

            this.obstacles.onAdd.add(this.onObstacleAdd.bind(this));
            this.obstacles.onDelete.add(this.onObstacleDelete.bind(this));

        }

        toString() {
            return this.x + "," + this.y;
        }

        mergeVisibility(newSlice, polygon) {

            //Grab all of the slices and loop through them
            for (let slice of this.visibility.uniques) {
                // console.log("slice", slice, newSlice);

                //Test if we can union with the slice
                let union = geo.angleUnion(newSlice.left, newSlice.right, slice.left, slice.right);
                // console.log(union);

                //We can union, so merge
                if (union) {

                    //Set the polygon visibiltiy to the union
                    this.visibility.set(polygon, union);

                    //Update all polygons that looked at the old slice to the union
                    for (let key of this.visibility.reverse(slice))
                        this.visibility.set(key, union);

                    //Might have joined two previously split angles, loop until we no longer can union
                    let flag = true;

                    loop: while (flag) {

                        //Set flag to false; we exit if it doesn't change
                        flag = false;

                        //Compare every slice to every other slice (but only once)
                        for (let slice of this.visibility.values) {

                            for (let slice2 of this.visibility.values) {

                                //Don't compare similar slices
                                if (slice === slice2) continue;

                                //Check if the two slices are unionable
                                let union = geo.angleUnion(slice.left, slice.right, slice2.left, slice2.right);
                                if (union) {

                                    //They are, update all polygons that pointed to the first slice to the new union
                                    for (let key of this.visibility.reverse(slice))
                                        this.visibility.set(key, union);

                                    //And update all that pointed to the second to the new union
                                    for (let key of this.visibility.reverse(slice2))
                                        this.visibility.set(key, union);

                                    //Set flag and try again
                                    flag = true;
                                    continue loop;

                                }
                            }
                        }
                    }

                    // console.log("mergeSlice", newSlice, union);
                    return true;

                }

            }

            // console.log("newSlice", newSlice, intersections);

            // console.log(this.visibility.uniques.size);
            this.visibility.set(polygon, newSlice);
            // console.log(this.visibility.uniques.size);

            return false;

        }

        onAdd(polygon, point) {

            let newSlice = new Angle(angleBetweenPoints(point, rPoint(polygon, point)),
                                     angleBetweenPoints(point, lPoint(polygon, point)));

            // if (this.x === 5 && this.y === 953) {
                console.log("onAdd", this.toString(), "\t", polygon.id, polygon.colorName, newSlice);
                // console.trace();
            // }

            this.slices.set(polygon, newSlice);
            this.mergeVisibility(newSlice, polygon);

        }

        onDelete(polygon) {

            let slice = this.visibility.get(polygon),
                polygons, polygonsArr;

            //If the slice was never part of the polygon, simply quit
            if (!slice) return;

            //Grab all polygons that pointed to the same slice as the removed polygon
            polygons = this.visibility.reverse(slice);

            // if (this.x === 5 && this.y === 953) {
                console.log("onDelete", this.toString(), "\t", polygon.id, polygon.colorName, slice);
                // console.trace();
            // }

            //This is the only polygon looking here, just remove the slice
            if (polygons.size === 1) {
                this.visibility.delete(polygon);
                this.slices.delete(polygon);

                return;
            }

            //There are additional polygons, rebuild up remaining slices

            polygonsArr = [];
            for (let polygon of polygons) polygonsArr.push([polygon, this.slices.get(polygon)]);
            console.log("\t", polygonsArr);
            for (let polygon of this.visibility) console.log("\t\t", "beforeRemove", polygon[0].id, polygon[0].colorName);
            for (let i = 0; i < polygonsArr.length; i++) {
                // let temp = this.visibility.get(polygonsArr[i][0]);
                // console.log("\t\t\t", temp.id, temp.colorName);
                this.visibility.delete(polygonsArr[i][0]);
                // temp = this.visibility.get(polygonsArr[i][0]);
                // if (temp) console.log("\t\t\t", temp.id, temp.colorName);
                // else console.log("\t\t\t");
            }
            for (let polygon of this.visibility) console.log("\t\t", "afterRemove", polygon[0].id, polygon[0].colorName);
            for (let i = 0; i < polygonsArr.length; i++)
                if (polygonsArr[i][0] !== polygon) this.mergeVisibility(polygonsArr[i][1], polygonsArr[i][0]);
            for (let polygon of this.visibility) console.log("\t\t", "afterAdd", polygon[0].id, polygon[0].colorName);

        }

        onObstacleAdd(polygon) {

            console.log("obstacleAdd", this, polygon);

            //Only one, naive calculation only
            if (this.obstacles.size === 1) {

                let left = angleBetweenPoints(this, rPoint(polygon, this)),
                    right = angleBetweenPoints(this, lPoint(polygon, this));

                if (left > right) {
                    left -= Math.PI * 2;
                    right += Math.PI * 2;
                }

                let slice = new Angle(left, right);

                this.obstacleSlices.set(polygon, slice);

                //Obstacle takes less than 180 degrees; so point is external
                console.log(this.toString(), slice.valueOf(), slice);
                if (slice < Math.PI) this.external = true;
                else this.external = false;

                return;

            }

            //Multiple, must do complex calculations...
            console.error("Not yet coded...");

        }

        onObstacleDelete(polygon) {

            console.log("obstacleDelete", this, polygon);

        }

    }

    class PointSet extends Array {

        constructor(onAdd, onDelete, onEmpty) {
            super();

            this.points = new Map();
            this.pointCount = 0;

            this.onAdd = onAdd;
            this.onDelete = onDelete;
            this.onEmpty = onEmpty;
        }

        newPoint(x, y) {

            let point = new Point(x, y);
            point.id = this.pointCount++;

            if (this.onAdd) point.edges.onAdd.add(this.onAdd);
            if (this.onDelete) point.edges.onDelete.add(this.onDelete);
            if (this.onEmpty) point.edges.onEmpty.add(this.onEmpty);

            this.points.set(x + "," + y, point);
            this.push(point);

            return point;

        }

        getPoint(x, y) {
            return this.points.get(x + "," + y) || this.newPoint(x, y);
        }

    }

    window.PointSet = PointSet;
    window.Point = Point;

}(window));
