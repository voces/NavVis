
(function (window) {
    "use strict";

    let drawing = window.drawing,
        geo = window.geo,
        quadtree = new window.DQuadTree(5),
        activeChange = false,
        lastChange;

    function calcPolygonStats(polygon) {

        let distance,

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
            distance = geo.distanceBetweenPoints(polygon, polygon[i]);
            if (distance > polygon.radius) polygon.radius = distance;
        }

    }

    drawing.onAdd.push(function (path) {

        calcPolygonStats(path.footprint);

        quadtree.push(path.footprint);

    });

    drawing.onRemove.push(function (path) {

        quadtree.remove(path.footprint);

    });

    drawing.onChange.push(function (path) {

        lastChange = Date.now();

        if (!activeChange) {
            activeChange = true;
            let interval = setInterval(function() {

                if (Date.now() - lastChange >= 20) clearInterval(interval);
                else return;

                activeChange = false;

                quadtree.remove(path.footprint);

                calcPolygonStats(path.footprint);

                quadtree.push(path.footprint);

            }, 20);
        }

    });

    window.quadtree = quadtree;

}(window));
