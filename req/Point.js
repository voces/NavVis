
(function (window) {
    "use strict";

    //Holds all of our points (to avoid duplicates)
    //var points = [];

    var points = new Map();

    //General constructor, assumes points[x] is an array
    function Point(x, y) {

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

        points.set(x + "," + y, this);
        //points[x][y] = this;

    }

    Point.prototype.toString = function() {
        return this.x + "," + this.y;
    };

    //External function to grab a point
    function getPoint(x, y) {

        return points.get(x + "," + y) || new Point(x, y);

        /*//Check if the column exists
        if (typeof points[x] === "undefined") {

            //Create column
            points[x] = [];

            //Create and return point
            return new Point(x, y);

        //Check if point exists
        } else if (typeof points[x][y] === "undefined")

            //Create and return point
            return new Point(x, y);

        //Return existing point
        else return points[x][y];*/

    }

    window.getPoint = getPoint;

}(window));
