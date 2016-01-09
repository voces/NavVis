
(function (window) {
    "use strict";

    /*let sqr = (x) => x * x;
    let dist2 = (v, w) => sqr(v.x - w.x) + sqr(v.y - w.y);

    function distToSegmentSquared(p, v, w) {
        let l2 = dist2(v, w);
        if (l2 === 0) return dist2(p, v);
        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        if (t < 0) return dist2(p, v);
        if (t > 1) return dist2(p, w);
        return dist2(p, {x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y)});
    }

    let distToSegment = (p, v, w) => Math.sqrt(distToSegmentSquared(p, v, w));*/

    function distToSegment(a, b) {

        let C = b.x - a.x,
            D = b.y - a.y,

            dot = (-a.x) * C + (-a.y) * D,
            len_sq = C * C + D * D,
            param = -1,

            xx, yy;

        if (len_sq != 0) //in case of 0 length line
            param = dot / len_sq;

        xx = -a.x - param * C;
        yy = -a.y - param * D;

        return Math.sqrt(xx * xx + yy * yy);
    }

    class Edge {
        constructor(a, b) {

            this[0] = a;
            this[1] = b;

            a.edges.add(this);
            b.edges.add(this);

            this.cells = [];
            this.obstacle = undefined;

            this.angle = Math.abs(Math.atan2(b.y - a.y, b.x - a.x));
            this.distanceTo = distToSegment(a, b);
            console.log(a.toString(), b.toString(), this.angle, this.distanceTo);

        }

        toString() {
            return this[0].toString() + " - " + this[1].toString();
        }
    }

    Edge.overlap = function(a, b) {

        if (a.angle !== b.angle || a.distanceTo !== b.distanceTo)
            return 0;

        let a1 = a[0],
            a2 = a[1],
            b1 = b[0],
            b2 = b[1];

        if (a.angle === Math.PI / 2) {

            if (a2.y < a1.y) {
                let temp = a1;
                a1 = a2;
                a2 = temp;
            }

            if (b2.y < b1.y) {
                let temp = b1;
                b1 = b2;
                b2 = temp;
            }

            if (b1.y < a1.y) {
                let temp = a1;
                a1 = b1;
                b1 = temp;

                temp = a2;
                a2 = b2;
                b2 = temp;
            }

            if (b1.y === a2.y) return 1;
            else if (b1.y < a2.y) return 2;
            else return 0;

        }

        if (a2.x < a1.x) {
            let temp = a1;
            a1 = a2;
            a2 = temp;
        }

        if (b2.x < b1.x) {
            let temp = b1;
            b1 = b2;
            b2 = temp;
        }

        if (b1.x < a1.x) {
            let temp = a1;
            a1 = b1;
            b1 = temp;

            temp = a2;
            a2 = b2;
            b2 = temp;
        }

        if (b1.x === a2.x) return 1;
        else if (b1.x < a2.x) return 2;
        else return 0;

    };

    class EdgeSet {
        constructor() {
            this.edges = new Map();
            this.count = 0;
        }

        newEdge(a, b) {

            let edge = new Edge(a, b),
                tMap;

            edge.id = this.count++;

            if (edge.id === 22) console.trace("edge 22");

            //Assure we can get to the edge from a
            if (tMap = this.edges.get(a))
                tMap.set(b, edge);
            else {
                this.edges.set(a, (tMap = new Map()));
                tMap.set(b, edge);
            }

            //Assure we can get to the edge from b
            if (tMap = this.edges.get(b))
                tMap.set(a, edge);
            else {
                this.edges.set(b, tMap = new Map());
                tMap.set(a, edge);
            }

            //Return it
            return edge;
        }

        getEdge(a, b) {

            let tMap;

            //Attempt to grab the edge, otherwise generate a new one and return that

            if (tMap = this.edges.get(a)) return tMap.get(b) || this.newEdge(a, b);
            else return this.newEdge(a, b);

        }

        getEdgeNoCreate(a, b) {

            let tMap;

            if (tMap = this.edges.get(a)) return tMap.get(b);

            return null;

        }

        dropEdge(a, b) {

            let tMap;

            if (a instanceof Edge) {
                if (tMap = this.edges.get(a[0])) tMap.delete(a[1]);
                if (tMap = this.edges.get(a[1])) tMap.delete(a[0]);
                a[0].edges.delete(a[1]);
                a[1].edges.delete(a[0]);
            } else {
                if (tMap = this.edges.get(a)) tMap.delete(b);
                if (tMap = this.edges.get(b)) tMap.delete(a);
                a.edges.delete(b);
                b.edges.delete(a);
            }

        }

    }

    window.Edge = Edge;
    window.EdgeSet = EdgeSet;

}(window));
