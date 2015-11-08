
(function (window) {
    "use strict";

    let drawing = window.drawing,
        NavMesh = window.NavMesh,

        navmesh = new NavMesh(0, 0, window.innerWidth, window.innerHeight),

        immediate = true,
        sampleSets = [],
        samples, addTimes = [], removeTimes = [],

        squareSize = 8,
        radiusSize = 4;

    /*let interval = setInterval(function() {
        try {
            navmesh.path({radius: 8});
        } catch (err) {
            clearInterval(interval);
            throw err;
        }
    }, 1000);*/

    drawing.onAdd.push(function (path) {

        path.footprint.drawingElement = path;
        navmesh.addStatic(path.footprint);

        //let start = performance.now();
        if (immediate) navmesh.path({radius: radiusSize});
        //addTimes.push(performance.now() - start);

    });

    drawing.onRemove.push(function (path) {

        navmesh.removeStatic(path.footprint);

        if (immediate) navmesh.path({radius: radiusSize});

    });

    function pToString() {
        return this.x + "," + this.y;
    }

    function p(x, y) {
        let point = {x: x, y: y};
        point.toString = pToString;
        return point;
    }

    function newSquare(x, y) {

        let square = new drawing.Path([
            p(x - squareSize, y + squareSize),
            p(x - squareSize, y - squareSize),
            p(x + squareSize, y - squareSize),
            p(x + squareSize, y + squareSize)
            /*new drawing.Point(x - squareSize, y + squareSize).append(),
            new drawing.Point(x - squareSize, y - squareSize).append(),
            new drawing.Point(x + squareSize, y - squareSize).append(),
            new drawing.Point(x + squareSize, y + squareSize).append()*/
        ]).close().draw().append();

        for (let i = 0; i < drawing.onAdd.length; i++)
            drawing.onAdd[i](square);

        return square;
    }

    function randomSquare() {

        let x = Math.floor(Math.random() * window.innerWidth),
            y = Math.floor(Math.random() * window.innerHeight);

        //samples.push({x: x, y: y});
        samples.push("newSquare(" + x + ", " + y + ");");

        let square = newSquare(x, y);

        return square;

    }

    function immediateGridSimple(density) {
        density = density || 75;

        immediate = false;

        for (let x = 2 / 3 * density; x < window.innerWidth - 2 / 3 * density; x += density)
            for (let y = 2 / 3 * density; y < window.innerHeight - 2 / 3 * density; y += density)
                newSquare(x, y);

        navmesh.path({radius: radiusSize});

        immediate = true;

    }

    function immediateChaos(count) {

        count = count || 100;

        immediate = false;

        for (let i = 0; i < count; i++)
            newSquare(Math.floor(Math.random() * window.innerWidth), Math.floor(Math.random() * window.innerHeight));

        navmesh.path({radius: radiusSize});

        immediate = true;

    }

    function nonimmediateChaos(count) {

        count = (count || 100) - 1;

        let interval = setInterval(function() {

            try {
                randomSquare();
            } catch (err) {
                console.log(err);
                console.log(samples.join("\n"));
                clearInterval(interval);
            }

            if (!count--) {
                clearInterval(interval);
                drawing.clearTemp(); navmesh.bases[0].walkableQT.drawAll(true);
            }

        }, 1);

    }

    function addRemoveChaos(count) {

        count = (count || 100) - 1;

        let interval = setInterval(function() {

            try {
                let start = performance.now();
                randomSquare();
                addTimes.push(performance.now() - start);

                let polygon = navmesh.statics[
                    Math.floor(Math.random() * navmesh.statics.length)].drawingElement;

                for (let i = 0; i < drawing.onRemove.length; i++)
                    drawing.onRemove[i](polygon);

                for (let i = 0; i < polygon.footprint.length; i++)
                    polygon.footprint[i].detach();

                polygon.detach();

                start = performance.now();
                navmesh.path({radius: radiusSize});
                removeTimes.push(performance.now() - start);

                randomSquare();
            } catch (err) {
                console.log(err);
                console.log(samples.join("\n"));
                clearInterval(interval);
            }

            if (!count--) {
                clearInterval(interval);
                drawing.clearTemp(); navmesh.bases[0].walkableQT.drawAll(true);
            }

        }, 1);

    }

    document.addEventListener("DOMContentLoaded", function () {

        document.addEventListener("keydown", function(e) {

            //Only do stuff when N key is pressed
            if (e.which !== 78) return;

            console.clear();
            drawing.clear();

            sampleSets.push(samples);
            samples = [];
            window.navmesh = navmesh = new NavMesh(0, 0, window.innerWidth, window.innerHeight);

            //immediateGridSimple(200);
            //immediateChaos(500);
            //nonimmediateChaos(10);

            //addRemoveChaos(1000);

            newSquare(672, 738);
            newSquare(672, 762);

            drawing.clearTemp(); navmesh.bases[0].walkableQT.drawAll(true);

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

            //If a polygon merges through a colinear point, the edge isn't always dropped;
            //  Need to loop through all old points and check rPoint edge
            /*newSquare(1343, 80);
            newSquare(783, 725);
            newSquare(10, 608);
            newSquare(1658, 563);
            newSquare(1501, 601);
            newSquare(577, 851);
            newSquare(779, 20);
            newSquare(42, 579);
            newSquare(310, 152);
            newSquare(684, 558);
            newSquare(702, 592);*/

            //QuadTree [this.id] set to [] when a parent splits (changed to remove parent)
            /*newSquare(1722, 594);
            newSquare(1316, 572);
            newSquare(1252, 159);
            newSquare(1060, 81);
            newSquare(999, 223);
            newSquare(427, 306);
            newSquare(949, 481);
            newSquare(602, 745);
            newSquare(214, 420);
            newSquare(1722, 5);
            newSquare(1123, 436);
            newSquare(1347, 925);
            newSquare(387, 699);
            newSquare(1676, 277);
            newSquare(1434, 112);
            newSquare(1180, 417);
            newSquare(1665, 433);
            newSquare(273, 588);
            newSquare(977, 405);
            newSquare(290, 493);*/

            //Must drop collapsed edges of eaten polygons
            /*newSquare(1774, 20);
            newSquare(309, 879);
            newSquare(1573, 16);
            newSquare(335, 231);
            newSquare(860, 16);
            newSquare(1133, 27);*/

            //Fixed issue when a grand-child and child would collapse at the same time
            /*newSquare(188, 121);
            newSquare(236, 192);
            newSquare(802, 292);
            newSquare(263, 928);
            newSquare(738, 860);
            newSquare(165, 537);
            newSquare(1839, 35);
            newSquare(97, 605);
            newSquare(22, 288);*/

            //Drop both edges of collapsed vertices
            /*newSquare(1042, 235);
            newSquare(1882, 120);
            newSquare(1233, 120);
            newSquare(1397, 85);*/

        });

    });

    window.navmesh = navmesh;

    Object.defineProperty(window, "samples", {
        get: function() {
            return samples;
        }
    });

    Object.defineProperty(window, "timings", {
        get: function() {
            return [addTimes, removeTimes];
        }
    });

    Object.defineProperty(window, "sampleSets", {
        get: function() {
            return sampleSets;
        }
    });

}(window));
