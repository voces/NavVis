
(function (window) {
    "use strict";

    let drawing = window.drawing,
        NavMesh = window.NavMesh,

        navmesh = new NavMesh(0, 0, window.innerWidth, window.innerHeight),

        immediate = true,
        sampleSets = [],
        samples, addTimes = [], removeTimes = [], sampleStep = 0,

        squareSize = 8,
        radiusSize = 4;

    samples = [{x: 1592, y: 653}, {x: 632, y: 334}, {x: 1504, y: 640}, {x: 1405, y: 37}, {x: 727, y: 471},
        {x: 451, y: 941}, {x: 690, y: 590}, {x: 465, y: 66}, {x: 326, y: 951}, {x: 1216, y: 372},
        {x: 1765, y: 424}, {x: 62, y: 619}, {x: 1467, y: 59}, {x: 13, y: 92}, {x: 183, y: 591}];

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

        samples.push({x: x, y: y});
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
        //samples.push("newSquare(" + x + ", " + y + ");");

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

                polygon.detach();

                start = performance.now();
                navmesh.path({radius: radiusSize});
                removeTimes.push(performance.now() - start);

                randomSquare();
            } catch (err) {
                console.error(err);
                console.log(samples);
                clearInterval(interval);
            }

            if (!count--) {
                clearInterval(interval);
                drawing.clearTemp(); navmesh.bases[0].walkableQT.drawAll(true);
            }

        }, 1);

    }

    //Cleaning: (([^,]*,){10}) with \1\n
    document.addEventListener("DOMContentLoaded", function () {

        document.addEventListener("keydown", function(e) {


            switch (e.which) {

            //Only do stuff when N key is pressed
            case 78: testKey(); break;

            //s
            case 83: runSample(); break;

            //k
            case 75: stepSample(); break;

            //d
            case 68: deleteSample(); break;

            //r
            case 82: fullRun(); break;

            //default: console.log(e.which);

            }

        });

    });

    function fullRun() {
        drawing.clear();

        window.navmesh = navmesh = new NavMesh(0, 0, window.innerWidth, window.innerHeight);

        for (let i = 0; i < samples.length; i++)
            newSquare(samples[i].x, samples[i].y);

        drawing.clearTemp(); navmesh.bases[0].walkableQT.drawAll();
    }

    function runSample() {
        //console.clear();
        drawing.clear();

        console.log("testing", sampleStep);

        window.navmesh = navmesh = new NavMesh(0, 0, window.innerWidth, window.innerHeight);

        try {
            for (let i = 0; i < samples.length; i++)
                if (sampleStep !== i)
                    newSquare(samples[i].x, samples[i].y);
        } catch (err) {
            console.error(err);
        }

        drawing.clearTemp(); navmesh.bases[0].walkableQT.drawAll(true);

    }

    function deleteSample() {
        console.log("deleting", sampleStep);
        samples.splice(sampleStep, 1);
        runSample();
    }

    function stepSample() {
        console.log("keeping", sampleStep);
        sampleStep++;
        runSample();
    }

    function testKey() {
        console.clear();
        drawing.clear();

        sampleSets.push(samples);
        samples = [];
        window.navmesh = navmesh = new NavMesh(0, 0, window.innerWidth, window.innerHeight);

        //immediateGridSimple(200);
        //immediateChaos(500);
        // nonimmediateChaos(2000);

        addRemoveChaos(1000);

        // drawing.clearTemp(); navmesh.bases[0].walkableQT.drawAll();

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

        //Clipper & Earcut don't play nice with holes that expose themselves
        /*newSquare(72, 38);
        newSquare(72, 62);*/

        //Fixed an issue inside ClipperLib that caused the PolyTree to be incorrect
        //Posted fix on JSClipper: http://sourceforge.net/p/jsclipper/tickets/7/
        /*{x: 1329, y: 423}, {x: 1596, y: 36}, {x: 324, y: 368}, {x: 1608, y: 399}, {x: 1120, y: 111},
            {x: 1279, y: 101}, {x: 952, y: 197}, {x: 1401, y: 186}, {x: 1554, y: 71}, {x: 1011, y: 388},
            {x: 1036, y: 219}, {x: 1170, y: 178}, {x: 1224, y: 403}, {x: 1377, y: 328}, {x: 1205, y: 383},
            {x: 1311, y: 389}*/

        //Fixed an issue relating to precision (requires scaling in subtract)
        // newSquare(632, 334);
        // newSquare(451, 941);
        // newSquare(465, 66);
        // newSquare(62, 619);
        // newSquare(13, 92);
        // newSquare(183, 591);
    }

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
