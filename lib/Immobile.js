
(function (window) {

    "use strict";

    const Polygon = window.Polygon;

    class Immobile extends Polygon {

        constructor(mVis, pointArray) {

            //Called slice or something similar

            if (typeof mVis === "number") return super(mVis);

            let arr = [];

            // console.trace("Immobile.constructor", mVis, pointArray);

            for (let i = 0; i < pointArray.length; i++)
                arr.push(mVis.pointSet.newPoint(pointArray[i].x, pointArray[i].y));

            super(arr);

        }

    }

    window.Immobile = Immobile;

}(window));
