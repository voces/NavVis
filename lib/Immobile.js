
(function (window) {

    "use strict";

    const Polygon = window.Polygon;

    class Immobile extends Polygon {

        constructor(MVis, pointArray) {

            let arr = [];

            for (let i = 0; i < pointArray.length; i++)
                arr.push(MVis.pointSet.newPoint(pointArray[i].x, pointArray[i].y));

            super(arr);

        }

    }

    window.Immobile = Immobile;

}(window));
