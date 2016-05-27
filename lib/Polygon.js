
(function (window) {

    "use strict";

    const geo = window.geo,
        util = window.util;

    class Polygon extends Array {

        constructor(arr) {

            if (typeof arr === "number") return super(arr);

            super(...arr);

            this.calcStats();

        }

        calcStats() {

            //Initialize the polygon's min and max
            this.min = {x: Infinity, y: Infinity};
            this.max = {x: -Infinity, y: -Infinity};

            //For calculating the center
            this.x = this.y = 0;

            //Initialize radius to zero
            this.radius = 0;

            for (let i = 0; i < this.length; i++) {

                //Sum (for calculating center)
                this.x += this[i].x;
                this.y += this[i].y;

                //Update this polygon's min/max
                if (this[i].x > this.max.x) this.max.x = this[i].x;
                if (this[i].y > this.max.y) this.max.y = this[i].y;
                if (this[i].x < this.min.x) this.min.x = this[i].x;
                if (this[i].y < this.min.y) this.min.y = this[i].y;

                //Find largest radius
                let distance = geo.distanceBetweenPoints(this, this[i]);
                if (distance > this.radius) this.radius = distance;

            }

            //Mean (for calculating center)
            this.x /= this.length;
            this.y /= this.length;

        }

        intersectsPolygon(polygon) {

            for (let i = 0, n = 1; i < polygon.length; i++, n++) {
                if (n === polygon.length) n = 0;

                if (geo.linePolygonIntersect(polygon[i], polygon[n], this)) return true;

            }

            return false;

        }

    }

    window.Polygon = Polygon;

}(window));
