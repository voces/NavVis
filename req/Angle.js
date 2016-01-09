

(function (window) {
    "use strict";

    class Angle {

        constructor(left, right) {

            this.left = left;
            this.right = right;

        }

        valueOf() {
            return Math.abs((this.right - this.left) % (Math.PI * 2));
        }

    }

    window.Angle = Angle;

}(window));
