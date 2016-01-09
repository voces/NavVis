
(function (window) {
    "use strict";

    class ReversibleMap extends Map {

        constructor() {

            super();

            this.uniques = new Set();
            this.reverseMap = new Map();

        }

        set(key, value) {

            // console.log("ReversibleMap.set");

            //Grab our old value (to manage unique tables)
            let oldValue = super.get(key);

            //If the new value matches the old, do nothing
            if (value === oldValue) return;

            //Set the key to the new value
            super.set(key, value);

            //Make sure the new value is in our list of uniques
            this.uniques.add(value);

            //Grab the set of things that point at the new value
            let reverseSet = this.reverseMap.get(value);

            //But first create a new set of it doesn't yet exist...
            if (!reverseSet) {
                reverseSet = new Set();
                this.reverseMap.set(value, reverseSet);
            }

            //Add the key to the set of things that point at the new value
            reverseSet.add(key);

            //Grab the set of things that pointed at the old value
            if (reverseSet = this.reverseMap.get(oldValue))

                //If the old set is now empty, kill the set and remove it from the uniques
                if (reverseSet.size === 1) {
                    this.reverseMap.delete(oldValue);
                    this.uniques.delete(oldValue);

                //Otherwise just update that set of things to indicate the key no longer points at it
                } else reverseSet.delete(key);

        }

        delete(key) {

            // console.log("ReversibleMap.delete");

            let value = super.get(key);
            super.delete(key);

            let reverseSet = this.reverseMap.get(value);
            if (!reverseSet) return;

            reverseSet.delete(key);

            if (reverseSet.size) this.reverseMap.set(value, reverseSet);
            else {
                this.reverseMap.delete(value);
                this.uniques.delete(value);
            }

        }

        reverse(value) {
            return this.reverseMap.get(value) || [];
        }

        get values() {
            return this.uniques;
        }

    }

    window.ReversibleMap = ReversibleMap;

}(window));
