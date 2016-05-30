
(function(window) {

    "use strict";

    function swapLoopArrReverse(arr) {

        for (let i = 0, j = (arr.length - 1), tmp; i < j; i++, j-- )
            tmp = arr[i],   arr[i] = arr[j],   arr[j] = tmp;

        return arr;

    }

    function arrayToString(list, joiner) {

        let arr = [];

        for (let i = 0; i < list.length; i++)
            arr[i] = list[i].toString();

        return arr.join(joiner);

    }

    function arrayToProp(list, prop, joiner) {

        let arr = [];

        for (let i = 0; i < list.length; i++)
            arr[i] = list[i][prop];

        return arr.join(joiner || ",");

    }

    function forceCounterClockwise(polygon) {

        let windingSum = (polygon[0].x - polygon[polygon.length - 1].x) * (polygon[0].y + polygon[polygon.length - 1].y);
        for (let i = 0; i < polygon.length - 1; i++)
            windingSum += (polygon[i + 1].x - polygon[i].x) * (polygon[i + 1].y + polygon[i].y);

        if (windingSum < 0) swapLoopArrReverse(polygon);

        return polygon;

    }

    //http://stackoverflow.com/a/32538867/1567335
    function isIterable(obj) {

        if (obj === null) return false;

        return typeof obj[Symbol.iterator] === "function";

    }

    window.util = {
        swapLoopArrReverse: swapLoopArrReverse,
        arrayToString: arrayToString,
        arrayToProp: arrayToProp,
        isIterable: isIterable,
        forceCounterClockwise: forceCounterClockwise
    };

}(window));
