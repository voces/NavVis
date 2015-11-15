/*eslint-disable no-console, no-unused-vars*/
(function (window) {
    "use strict";

    let $ = window.$,
        drawing = window.drawing,
        NavMesh = window.NavMesh,

        pos,

        navmesh = new NavMesh(0, 0, window.innerWidth, window.innerHeight),

        immediate = true,

        history = [], histories = [], historyStep = 0,
        historyAdjuster = [],

        sampleSets = [],
        samples, addTimes = [], removeTimes = [], sampleStep = 0,

        squareSize = 4,
        radiusSize = 2,

        testHistory = [
            ["add", 1329, 423], ["add", 1596, 36], ["add", 324, 368], ["add", 1608, 399], ["add", 1120, 111],
            ["add", 1279, 101], ["add", 952, 197], ["add", 1401, 186], ["add", 1554, 71], ["add", 1011, 388],
            ["add", 1036, 219], ["add", 1170, 178], ["add", 1224, 403], ["add", 1377, 328], ["add", 1205, 383],
            ["add", 1311, 389]
        ];
        /*testHistory = [
            ["add", 137, 63], ["add", 365, 38], ["remove", 365, 38], ["add", 101, 58], ["add", 199, 111],
            ["add", 162, 147], ["remove", 199, 111], ["add", 113, 77], ["add", 142, 113], ["add", 149, 79],
            ["add", 185, 130], ["add", 208, 102], ["add", 179, 117], ["add", 205, 111]];*/

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

    function paintExPolygon(exPolygon) {

        window.addToStringToPointList(exPolygon.outer);
        new drawing.Path(exPolygon.outer).fill("rgba(0,0,0,0)").close().draw().append();

        for (let i = 0; i < exPolygon.holes.length; i++) {
            window.addToStringToPointList(exPolygon.holes[i]);
            new drawing.Path(exPolygon.holes[i]).fill("rgba(0,0,0,0)").stroke("#666").dashed("10,10").width("1")
                .close().draw().append();
        }
    }

    function pToString() {
        return this.x + "," + this.y;
    }

    function p(x, y) {
        let point = {x: x, y: y};
        point.toString = pToString;
        return point;
    }

    function newSquare(x, y) {

        //samples.push({x: x, y: y});
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

        square.x = x;
        square.y = y;

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

        }, 0);

    }

    function addRemoveChaos(count) {

        histories.push(history);
        history = [];

        count = (count || 100) - 1;

        let interval = setInterval(function() {

            try {
                let start = performance.now();
                let square = randomSquare();
                addTimes.push(performance.now() - start);
                history.push(["add", square.x, square.y]);

                let polygonIndex = Math.floor(Math.random() * navmesh.statics.length);
                square = navmesh.statics[polygonIndex].drawingElement;

                for (let i = 0; i < drawing.onRemove.length; i++)
                    drawing.onRemove[i](square);

                square.detach();
                history.push(["remove", square.x, square.y]);

                start = performance.now();
                navmesh.path({radius: radiusSize});
                removeTimes.push(performance.now() - start);

                square = randomSquare();
                history.push(["add", square.x, square.y]);

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

    function fullHistory() {

        drawing.clear();
        window.navmesh = navmesh = new NavMesh(0, 0, window.innerWidth, window.innerHeight);

        for (let i = 0; i < testHistory.length; i++)
            if (testHistory[i][0] === "add")
                newSquare(testHistory[i][1], testHistory[i][2]);
            else if (testHistory[i][0] === "remove")
                for (let n = 0; n < navmesh.statics.length; n++)
                    if (navmesh.statics[n].drawingElement.x === testHistory[i][1] &&
                    navmesh.statics[n].drawingElement.y === testHistory[i][2]) {
                        let polygon = navmesh.statics[n].drawingElement;

                        for (let i = 0; i < drawing.onRemove.length; i++)
                            drawing.onRemove[i](polygon);

                        polygon.detach();

                        break;
                    }

        drawing.clearTemp(); navmesh.bases[0].walkableQT.drawAll();

    }

    function runHistory() {

        drawing.clear();
        window.navmesh = navmesh = new NavMesh(0, 0, window.innerWidth, window.innerHeight);

        for (let i = 0; i < testHistory.length; i++)
            if (historyStep !== i)
                if (testHistory[i][0] === "add")
                    newSquare(testHistory[i][1], testHistory[i][2]);
                else if (testHistory[i][0] === "remove")
                    for (let n = 0; n < navmesh.statics.length; n++)
                        if (navmesh.statics[n].drawingElement.x === testHistory[i][1] &&
                        navmesh.statics[n].drawingElement.y === testHistory[i][2]) {
                            let polygon = navmesh.statics[n].drawingElement;

                            for (let i = 0; i < drawing.onRemove.length; i++)
                                drawing.onRemove[i](polygon);

                            polygon.detach();

                            break;
                        }

        drawing.clearTemp(); navmesh.bases[0].walkableQT.drawAll(true);
        pos.text(Math.floor(historyStep / testHistory.length * 100) + "%");

    }

    function keepHistoryStep() {

        console.log("keeping", historyStep, testHistory.length);
        historyStep++;
        runHistory();

    }

    function deleteHistoryStep() {

        console.log("removing", historyStep, testHistory.length);
        testHistory.splice(historyStep, 1);
        runHistory();

    }

    //Cleaning: (([^,]*,){10}) with \1\n
    document.addEventListener("DOMContentLoaded", function () {

        pos = $("#pos");

        document.addEventListener("keydown", function(e) {

            switch (e.which) {

            //Only do stuff when N key is pressed
            case 78: testKey(); break;

            //r
            case 82: fullHistory(); break;

            //s
            case 83: runHistory(); break;

            //k
            case 75: keepHistoryStep(); break;

            //d
            case 68: deleteHistoryStep(); break;

            //s
            /*case 83: runSample(); break;

            //r
            case 82: fullRun(); break;*/

            //default: console.log(e.which);

            }

        });

    });

    function fullRun() {

        drawing.clear();
        window.navmesh = navmesh = new NavMesh(0, 0, window.innerWidth, window.innerHeight);

        for (let i = 0; i < samples.length; i++)
            newSquare(samples[i].x, samples[i].y);

        drawing.clearTemp(); navmesh.bases[0].walkableQT.drawAll(true);
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
        pos.text(Math.floor(sampleStep / samples.length * 100) + "%");

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
        // nonimmediateChaos(3000);

        addRemoveChaos(100);

        // drawing.clearTemp(); navmesh.bases[0].walkableQT.drawAll(true);

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

        //Fixed an issue relating to holes with one exterior vertex (merges it into outer)
        // [{x: 1836, y: 818}, {x: 1286, y: 690}, {x: 1681, y: 618}, {x: 1777, y: 774}, {x: 887, y: 848},
        //     {x: 1754, y: 765}]

        // Fixed an issue relating to holes (updated earcut)
        // [{x: 787, y: 240}, {x: 1621, y: 641}, {x: 1662, y: 722}, {x: 833, y: 445}, {x: 1256, y: 772},
        //     {x: 1455, y: 493}];

        // Fixed an issue relating to no setting edges for quicky-merged polygons
        // [{x: 1256, y: 104}, {x: 864, y: 237}, {x: 679, y: 323}, {x: 390, y: 341}, {x: 524, y: 75},
        //     {x: 926, y: 303}, {x: 752, y: 542}, {x: 864, y: 448}, {x: 645, y: 404}, {x: 839, y: 126},
        //     {x: 690, y: 336}, {x: 594, y: 127}, {x: 887, y: 474}, {x: 690, y: 288}, {x: 648, y: 396},
        //     {x: 611, y: 265}, {x: 812, y: 116}, {x: 760, y: 382}, {x: 801, y: 126}, {x: 644, y: 151},
        //     {x: 666, y: 162}, {x: 857, y: 332}]
    }

    window.navmesh = navmesh;
    window.paintExPolygon = paintExPolygon;

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

    Object.defineProperty(window, "history", {
        get: function() {
            return history;
        }
    });

    Object.defineProperty(window, "histories", {
        get: function() {
            return histories;
        }
    });

    Object.defineProperty(window, "testHistory", {
        get: function() {
            return testHistory;
        }
    });

}(window));
/*eslint-enable no-console, no-unused-vars*/
