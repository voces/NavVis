/*eslint-disable no-console*/

(function (window) {
    "use strict";

    // let $ = window.$,
    let drawing = window.drawing,
        mVis = new window.MVis({x: 0, y: 0}, {x: window.innerWidth, y: window.innerHeight});

    function onAdd(path) {

        mVis.addImmobile(path.footprint);

    }

    drawing.onAdd.push(path => {

        if (!path.live) onAdd(path);

    });

    drawing.onChange.push(path => {

        if (!path.live) onAdd(path);

    });

    window.mVis = mVis;

}(window));
/*eslint-enable no-console*/
