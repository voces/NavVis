
(function (window) {

    "use strict";

    const Immobile = window.Immobile;

    class ImmobileFactory {

        constructor(mVis) {

            this.mVis = mVis;

        }

        newImmobile(pointArray) {

            return new Immobile(this.mVis, pointArray);

        }

    }

    window.ImmobileFactory = ImmobileFactory;

}(window));
