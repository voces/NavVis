
(function(window) {

    "use strict";

    function swapLoopArrReverse(arr) {

        for (let i = 0, j = (arr.length - 1), tmp; i < j; i++, j-- )
            tmp = arr[i],   arr[i] = arr[j],   arr[j] = tmp;

        return arr;

    }

    window.util = {
        swapLoopArrReverse: swapLoopArrReverse
    };

}(window));
