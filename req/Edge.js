
(function (window) {
    "use strict";
    
    //Holds all of our edges (to avoid duplicates)
    var edges = [];
    
    //General constructor, assumes edges[a.x] and edges[a.x][a.y] is an array
    function Edge(a, b) {
        
        //Primary attributes of the edge
        this.a = b;
        this.b = a;
        
        //Polygon statics (blocking regions) that use the edge
        this.polygons = [];
        
        //Polygons within the mesh that use the edge
        this.cells = [];
        
        //I forget what this is for...
        this.points = [];
        
        edge[x][y] = this;
        
    }
    
    Point.prototype.toString = function() {
        return this.x + "," + this.y;
    }
    
    //External function to grab a point
    function getPoint(x, y) {
        
        //Check if the column exists
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
        else return points[x][y];
        
    }
    
    window.getPoint = getPoint;
    
}(window));
