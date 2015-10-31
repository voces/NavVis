
(function (window) {
    "use strict";

    var drawing = window.drawing,
        NavMesh = window.NavMesh,

        navmesh = new NavMesh(0, 0, window.innerWidth, window.innerHeight);

    /*function pointListToEarcut(list) {

        var earcutList = [],

            i;

        for (i = 0; i < list.length; i++) {
            earcutList.push(list[i].x);
            earcutList.push(list[i].y);
        }

        return earcutList;

    }*/

    /*Drawing.onAdd.push(function (path) {
        if (typeof path.polygonTable === "undefined") path.polygonTable = [];
        pathing.addStatic(path);

        doPath();
    });*/

    drawing.onAdd.push(function (path) {

        navmesh.addStatic(path.footprint);

        navmesh.path({radius: 8});

        /*var appendedPath = [
                {x: 0, y: 0},
                {x: window.innerWidth, y: 0},
                {x: window.innerWidth, y: window.innerHeight},
                {x: 0, y: window.innerHeight}
            ].concat(path.footprint),

            flatList = pointListToEarcut(appendedPath),

            triangles = earcut(flatList, [4]),

            i;

        for (i = 0; i < triangles.length; i += 3) {

            navis.addStatic([]);
        }*/

    });

    window.navmesh = navmesh;

}(window));
