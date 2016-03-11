
(function (window) {

    "use strict";

    const Walkable = window.Walkable;

    class WalkableFactory {

        constructor(mVis) {

            this.mVis = mVis;

        }

        newWalkable(pointArray) {

            return new Walkable(this.mVis, pointArray);

        }

    }

    window.WalkableFactory = WalkableFactory;

}(window));
