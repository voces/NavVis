
(function (window) {
    "use strict";

    let drawing = window.drawing,
        NavMesh = window.NavMesh,

        navmesh = new NavMesh(0, 0, window.innerWidth, window.innerHeight);

    drawing.onAdd.push(function (path) {

        navmesh.addStatic(path.footprint);

        navmesh.path({radius: 8});

    });

    function newSquare(x, y) {

        let square = new drawing.Path([
            new drawing.Point(x - 25, y + 25).append(),
            new drawing.Point(x - 25, y - 25).append(),
            new drawing.Point(x + 25, y - 25).append(),
            new drawing.Point(x + 25, y + 25).append()
        ]).close().draw().append();

        for (let i = 0; i < drawing.onAdd.length; i++)
            drawing.onAdd[i](square);

        return square;
    }

    function randomSquare() {

        let x = Math.floor(Math.random() * window.innerWidth),
            y = Math.floor(Math.random() * window.innerHeight),

            square = newSquare(x, y);

        console.log(x, y);

        return square;

    }

    document.addEventListener("DOMContentLoaded", function () {

        document.addEventListener("keydown", function(e) {

            //Only do stuff when N key is pressed
            if (e.which !== 78) return;
            console.clear();
            drawing.clear();
            navmesh = new NavMesh(0, 0, window.innerWidth, window.innerHeight);

            //randomSquare(); randomSquare(); randomSquare();

            newSquare(1459, 434);
            newSquare(1555, 44);
            //newSquare(1048, 869);

        });

    });

    window.navmesh = navmesh;

}(window));
