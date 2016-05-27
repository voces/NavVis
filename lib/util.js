
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

    //http://stackoverflow.com/a/32538867/1567335
    function isIterable(obj) {

        if (obj === null) return false;

        return typeof obj[Symbol.iterator] === "function";

    }

    window.util = {
        swapLoopArrReverse: swapLoopArrReverse,
        arrayToString: arrayToString,
        isIterable: isIterable
    };

}(window));
