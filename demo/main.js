/*eslint-disable no-console*/

(function (window) {
    "use strict";

    // let $ = window.$,
    let drawing = window.drawing,
        util = window.util,
        mVis = new window.MVis({x: 0, y: 0}, {x: window.innerWidth, y: window.innerHeight});

    function onAdd(path) {

        let windingSum = (path.footprint[0].x - path.footprint[path.footprint.length - 1].x) * (path.footprint[0].y + path.footprint[path.footprint.length - 1].y);
        for (let i = 0; i < path.footprint.length - 1; i++)
            windingSum += (path.footprint[i + 1].x - path.footprint[i].x) * (path.footprint[i + 1].y + path.footprint[i].y);

        if (windingSum < 0)
            util.swapLoopArrReverse(path.footprint);

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
