/*eslint-disable no-console*/

(function (window) {
    "use strict";

    // let $ = window.$,
    let drawing = window.drawing,
        util = window.util,
        mVis = new window.MVis({x: 0, y: 0}, {x: window.innerWidth, y: window.innerHeight});

    function onAdd(path) {

        // console.log("before", util.arrayToString(path.footprint, "   "));

        util.forceCounterClockwise(path.footprint);

        // console.log("after", util.arrayToString(path.footprint, "   "));

        mVis.addImmobile(path.footprint);

    }

    drawing.onAdd.push(path => {

        if (!path.live) onAdd(path);

    });

    drawing.onChange.push(path => {

        if (!path.live) onAdd(path);

    });

    document.addEventListener("DOMContentLoaded", () => {

        let mainLayer = new drawing.Layer().append();
        drawing.setDefaultParent(mainLayer);

    });

    window.mVis = mVis;

}(window));
/*eslint-enable no-console*/
