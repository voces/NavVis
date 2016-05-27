
(function (window) {

    "use strict";

    const Polygon = window.Polygon;

    class Walkable extends Polygon {

        constructor(mVis, pointArray) {

            if (typeof mVis === "number") return super(mVis);

            let arr = [];

            for (let i = 0; i < pointArray.length; i++)
                arr.push(mVis.pointSet.newPoint(pointArray[i].x, pointArray[i].y));

            super(arr);

        }

    }

    window.Walkable = Walkable;

}(window));
