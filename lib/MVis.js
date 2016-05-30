
(function (window) {

    "use strict";

    let DQuadTree = window.DQuadTree,

        drawing = window.drawing,

        // Color = window.Color,

        PointSet = window.PointSet,
        hxSnoeyinkKeil = window.hxGeomAlgo.SnoeyinkKeil.decomposePoly,
        // Point = window.Point,
        // Edge = window.Edge,
        // EdgeSet = window.EdgeSet,
        // Angle = window.Angle,

        // geo = window.geo,
        geo = window.geo,
        util = window.util,

        ImmobileFactory = window.ImmobileFactory,
        WalkableFactory = window.WalkableFactory;

        // ClipperLib = window.ClipperLib;

    function snoeyinkKeil(polygon) {

        let topRightIdx = 0,
            p = polygon[0];

        for (let i = 0; i < polygon.length; i++) {
            let q = polygon[i];

            if (q.y < p.y || (q.y == p.y && q.x > p.x)) {
                topRightIdx = i;
                p = q;
            }
        }

        if (topRightIdx !== 0)
            polygon.push(...polygon.splice(0, topRightIdx));

        return hxSnoeyinkKeil(polygon);

    }

    class MVis {

        constructor(min, max) {

            this.min = min || {x: -Infinity, y: -Infinity};
            this.max = max || {x: Infinity, y: Infinity};

            //Factories
            this.pointSet = new PointSet();
            this.immobileFactory = new ImmobileFactory(this);
            this.walkableFactory = new WalkableFactory(this);

            //Arrays
            this.immobileQT = new DQuadTree(16, null, this.min, this.max);
            this.walkableQT = new DQuadTree(32, null, this.min, this.max);

            //Create our initial walkable
            let bounds = this.walkableFactory.newWalkable([
                this.min, {x: this.min.x, y: this.max.y},
                this.max, {x: this.max.x, y: this.min.y}
            ]);

            this.walkableQT.push(bounds);

        }

        addImmobile(immobile) {

            immobile = this.immobileFactory.newImmobile(immobile);
            this.immobileQT.push(immobile);

            let iterator = this.walkableQT.iterateInRange(immobile.min, immobile.max),
                result,
                intersectingWalkables = [];

            while (result = iterator.next().value)
                if (result.intersectsPolygon(immobile)) intersectingWalkables.push(result);

            if (intersectingWalkables.length === 1)
                this.simpleImmobileAdd(intersectingWalkables[0], immobile);

            else this.complexImmobileAdd(intersectingWalkables, immobile);

        }



        buildNewWalkable(walkable, start, limit) {

        }

        complexImmobileAdd(walkables, immobile) {

            //Merge the old walkables into one
            let walkable = geo.merge(walkables);

            // console.log("merged", walkable);
            console.log("merged", util.arrayToProp(walkable, "id"));

            // return;

            let newPolygon = geo.bridgeHole(walkable, immobile);

            let textLayer = new drawing.Layer().layer(drawing.svg).append();

            for (let i = 0; i < newPolygon[0].length; i++)
                new drawing.Text(newPolygon[0][i].id,
                    Math.max(8, Math.min(window.innerWidth - 8, newPolygon[0][i].x)),
                    Math.max(8, Math.min(window.innerHeight - 12, newPolygon[0][i].y))).layer(textLayer).append();

            for (let i = 0; i < newPolygon[1].length; i++)
                new drawing.Text(newPolygon[1][i].id,
                    Math.max(8, Math.min(window.innerWidth - 8, newPolygon[1][i].x)),
                    Math.max(8, Math.min(window.innerHeight - 12, newPolygon[1][i].y))).layer(textLayer).append();

            let mosaic = snoeyinkKeil(newPolygon[0]);
            for (let i = 0; i < mosaic.length; i++) {

                util.forceCounterClockwise(mosaic[i]);

                let walkable = this.walkableFactory.newWalkable(mosaic[i]);
                walkable.path = new drawing.Path(mosaic[i]).fill("rgba(255,0,0,.5)").close().width(1).draw().append();
                this.walkableQT.push(walkable);
                // console.log("walkable", util.arrayToProp(mosaic[i], "id"));

            }

            mosaic = snoeyinkKeil(newPolygon[1]);
            for (let i = 0; i < mosaic.length; i++) {

                util.forceCounterClockwise(mosaic[i]);

                let walkable = this.walkableFactory.newWalkable(mosaic[i]);
                walkable.path = new drawing.Path(mosaic[i]).fill("rgba(255,0,0,.5)").close().width(1).draw().append();
                this.walkableQT.push(walkable);
                // console.log("walkable", util.arrayToProp(mosaic[i], "id"));

            }

            //Remove the old walkables
            for (let i = 0; i < walkables.length; i++) {
                this.walkableQT.remove(walkables[i]);
                if (walkables[i].path) walkables[i].path.detach();
            }

        }

        simpleImmobileAdd(walkable, immobile) {

            console.log("simpleImmobileAdd", walkable);

            let newPolygon = geo.bridgeHole(walkable, immobile);

            console.log("parts", util.arrayToProp(newPolygon[0], "id"), util.arrayToProp(newPolygon[1], "id"));

            this.walkableQT.remove(walkable);
            if (walkable.path) walkable.path.detach();

            // console.log(newPolygon, util.arrayToString(newPolygon[0], " "), util.arrayToString(newPolygon[1], " "));

            // new drawing.Path(newPolygon[0]).fill("rgba(0,255,0,.2)").close().draw().append();
            // new drawing.Path(newPolygon[1]).fill("rgba(0,0,255,.2)").close().draw().append();

            let textLayer = new drawing.Layer().layer(drawing.svg).append();

            for (let i = 0; i < newPolygon[0].length; i++)
                new drawing.Text(newPolygon[0][i].id,
                    Math.max(8, Math.min(window.innerWidth - 8, newPolygon[0][i].x)),
                    Math.max(8, Math.min(window.innerHeight - 12, newPolygon[0][i].y))).layer(textLayer).append();

            for (let i = 0; i < newPolygon[1].length; i++)
                new drawing.Text(newPolygon[1][i].id,
                    Math.max(8, Math.min(window.innerWidth - 8, newPolygon[1][i].x)),
                    Math.max(8, Math.min(window.innerHeight - 12, newPolygon[1][i].y))).layer(textLayer).append();

            let mosaic = snoeyinkKeil(newPolygon[0]);
            for (let i = 0; i < mosaic.length; i++) {

                util.forceCounterClockwise(mosaic[i]);

                let walkable = this.walkableFactory.newWalkable(mosaic[i]);
                walkable.path = new drawing.Path(mosaic[i]).fill("rgba(255,0,0,.5)").close().width(1).draw().append();
                this.walkableQT.push(walkable);
                // console.log("walkable", util.arrayToProp(mosaic[i], "id"));

            }

            mosaic = snoeyinkKeil(newPolygon[1]);
            for (let i = 0; i < mosaic.length; i++) {

                util.forceCounterClockwise(mosaic[i]);

                let walkable = this.walkableFactory.newWalkable(mosaic[i]);
                walkable.path = new drawing.Path(mosaic[i]).fill("rgba(255,0,0,.5)").close().width(1).draw().append();
                this.walkableQT.push(walkable);
                // console.log("walkable", util.arrayToProp(mosaic[i], "id"));

            }

        }


    }

    window.MVis = MVis;

}(window));
