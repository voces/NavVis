
(function (window) {

    "use strict";

    let DQuadTree = window.DQuadTree,

        drawing = window.drawing,

        // Color = window.Color,

        PointSet = window.PointSet,
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

        }



        buildNewWalkable(walkable, start, limit) {

        }

        simpleImmobileAdd(walkable, immobile) {

            let newPolygon = geo.bridgeHole(walkable, immobile);

            new drawing.Path(newPolygon).fill("rgba(0,255,0,.1)").close().draw().append();

            console.log(newPolygon.outerBridgeIndex, newPolygon);

            let mosaic = geo.mosaic(newPolygon);



            // for (let i = 0; i < mosaic.length; i++)
                // new drawing.Path(mosaic[i]).fill("rgba(255,0,0,.3)").append();

            console.log(mosaic);


            // new drawing.Path(newPolygon).fill("rgba(255,0,0,.3)").append();
            //
            // for (let i = 0; i < newPolygon.length; i++) {
            //
            //     let x = newPolygon[i].x,
            //         y = newPolygon[i].y;
            //
            //     if (x < 8) x = 8;
            //     else if (x > window.innerWidth - 8) x = window.innerWidth - 8;
            //
            //     if (y < 8) y = 8;
            //     else if (y > window.innerHeight - 40) y = window.innerHeight - 40;
            //
            //     // console.log(`new drawing.Text(${i}, ${x}, ${y}).append();`);
            //     new drawing.Text(i, x, y).append();
            // }


        }


    }

    window.MVis = MVis;

}(window));
