
(function (window) {
    "use strict";

    let drawing = window.drawing,
        NavMesh = window.NavMesh,

        navmesh = new NavMesh(0, 0, window.innerWidth, window.innerHeight),

        immediate = true;

    /*let interval = setInterval(function() {
        try {
            navmesh.path({radius: 8});
        } catch (err) {
            clearInterval(interval);
            throw err;
        }
    }, 1000);*/

    drawing.onAdd.push(function (path) {

        navmesh.addStatic(path.footprint);

        if (immediate) navmesh.path({radius: 8});

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
            y = Math.floor(Math.random() * window.innerHeight);

        console.log(x, y);

        let square = newSquare(x, y);

        return square;

    }

    function immediateGridSimple(density) {
        density = density || 75;

        immediate = false;

        for (let x = 2 / 3 * density; x < window.innerWidth - 2 / 3 * density; x += density)
            for (let y = 2 / 3 * density; y < window.innerHeight - 2 / 3 * density; y += density)
                newSquare(x, y);

        navmesh.path({radius: 8});

        immediate = true;

    }

    function immediateChaos(count) {

        count = count || 100;

        immediate = false;

        for (let i = 0; i < count; i++)
            newSquare(Math.floor(Math.random() * window.innerWidth), Math.floor(Math.random() * window.innerHeight));

        navmesh.path({radius: 8});

        immediate = true;

    }

    document.addEventListener("DOMContentLoaded", function () {

        document.addEventListener("keydown", function(e) {

            //Only do stuff when N key is pressed
            if (e.which !== 78) return;

            console.clear();
            drawing.clear();
            window.navmesh = navmesh = new NavMesh(0, 0, window.innerWidth, window.innerHeight);

            //immediateGridSimple();
            immediateChaos(500);

            /*let density = 75;

            let xL = density / 2;
            function outer() {
                if (xL >= window.innerWidth) {
                    clearInterval(outer);
                    return;
                }

                let yL = density / 2;
                let inner = setInterval(function() {

                    if (yL >= window.innerHeight) {
                        clearInterval(inner);

                        xL += density;

                        if (xL < window.innerWidth) {
                            outer();
                            return;
                        }
                    }

                    let x = xL, y = yL;
                    let r = Math.random() * 100;
                    if (r < 5) {
                        x += (Math.floor(Math.random() * 2) * 2 - 1) * 25;
                        y += (Math.floor(Math.random() * 2) * 2 - 1) * 25;
                    } else if (r < 10) x += (Math.floor(Math.random() * 2) * 2 - 1) * 25;
                    else if (r < 15) y += (Math.floor(Math.random() * 2) * 2 - 1) * 25;

                    try { newSquare(x, y); }
                    catch (err) {
                        clearInterval(inner);
                        clearInterval(outer);
                        throw err;
                    }

                    yL += density;

                }, 100);
            }

            outer();*/

            /*for (let xL = density / 2; xL < window.innerWidth; xL += density)
                for (let yL = density / 2; yL < window.innerHeight; yL += density) {

                }*/

            //for (let i = 0; i < 100; i++)
                //randomSquare();

            /*newSquare(1726, 876);
            newSquare(1339, 705);
            newSquare(1348, 106);*/

            /*newSquare(1791, 196);
            newSquare(451, 696);
            newSquare(1503, 897);*/

            /*newSquare(623, 464);
            newSquare(1706, 761);
            newSquare(912, 530);*/

        });

    });

    window.navmesh = navmesh;

}(window));
