
(function (window) {
    "use strict";

    class Point {

        constructor(x, y) {

            //Primary attributes of the point
            this.x = x;
            this.y = y;

            //Polygon statics (blocking regions) that use the point
            this.polygons = [];

            //Polygons within the mesh that use the point
            this.cells = [];

            //I forget what this is for...
            this.segments = new Set();

            this.lefts = new Map();
            this.rights = new Map();

            //Points we've tested in terms of visiblity and have passed
            this.visiblePoints = [];

            //points.set(x + "," + y, this);
            //points[x][y] = this;

        }

        toString() {
            return this.x + "," + this.y;
        }

    }

    class PointSet {

        constructor() {
            this.points = new Map();
        }

        newPoint(x, y) {

            let point = new Point(x, y);

            this.points.set(x + "," + y, point);

            return point;

        }

        getPoint(x, y) {
            return this.points.get(x + "," + y) || this.newPoint(x, y);
        }

    }

    window.PointSet = PointSet;
    window.Point = Point;

}(window));
