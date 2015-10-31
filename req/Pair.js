
(function (window) {
    "use strict";

    //A mapping of all pairs
    //  WARNING: Maps do not automatically garbage collect!
    var pairs = new Map();
    var pairsArray = [];

    function Pair(a, b) {

        this[0] = a;
        this[1] = b;

        this.cells = [];

        this.id = Pair.count++;

        pairsArray.push(this);

    }

    Pair.prototype = Object.create(Array.prototype);
    Pair.prototype.constructor = Pair;
    Pair.count = 0;

    //Creates a new pair, adds it to the map, and returns it
    function pair(a, b) {

        //Create new pair
        var myPair = new Pair(a, b),

            tMap;

        //Assure we can get to the pair from a
        if (tMap = pairs.get(a))
            tMap.set(b, myPair);
        else {
            pairs.set(a, (tMap = new Map()));
            tMap.set(b, myPair);
        }

        //Assure we can get to the pair from b
        if (tMap = pairs.get(b))
            tMap.set(a, myPair);
        else {
            pairs.set(b, tMap = new Map());
            tMap.set(a, myPair);
        }

        //Return it
        return myPair;

    }

    //External function to grab a pair
    function getPair(a, b) {

        var tMap;

        //Attempt to grab the pair, otherwise generate a new one and return that

        if (tMap = pairs.get(a)) return tMap.get(b) || pair(a, b);
        else return pair(a, b);

    }

    function dropPair(a, b) {

        var tMap;

        if (a instanceof Pair) {
            if (tMap = pairs.get(a[0])) tMap.delete(a[1]);
            if (tMap = pairs.get(a[1])) tMap.delete(a[0]);
        } else {
            if (tMap = pairs.get(a)) tMap.delete(b);
            if (tMap = pairs.get(b)) tMap.delete(a);
        }

    }

    function getPairById(id) {
        return pairsArray[id];
    }

    window.getPair = getPair;
    window.getPairById = getPairById;
    window.dropPair = dropPair;

}(window));
