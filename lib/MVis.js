
(function (window) {

    "use strict";

    let DQuadTree = window.DQuadTree,

        // drawing = window.drawing,

        // Color = window.Color,

        PointSet = window.PointSet,
        // Point = window.Point,
        // Edge = window.Edge,
        // EdgeSet = window.EdgeSet,
        // Angle = window.Angle,

        geo = window.geo,

        ImmobileFactory = window.ImmobileFactory,
        WalkableFactory = window.WalkableFactory;

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

            while (result = iterator.next().value) {

                if (result.intersectsPolygon(immobile)) intersectingWalkables.push(result);

            }

            console.log(intersectingWalkables);

        }


    }

    window.MVis = MVis;

}(window));
