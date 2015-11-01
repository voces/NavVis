
(function (window) {
    "use strict";

    class Edge {
        constructor(a, b) {

            this[0] = a;
            this[1] = b;

            this.cells = [];

            //this.id = Edge.count++;
        }
    }

    class EdgeSet extends Array {
        constructor() {
            super();

            this.edges = new Map();
            this.count = 0;
        }

        newEdge(a, b) {

            let edge = new Edge(a, b),
                tMap;

            edge.id = this.count++;

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

        dropEdge(a, b) {

            let tMap;

            if (a instanceof Edge) {
                if (tMap = this.edges.get(a[0])) tMap.delete(a[1]);
                if (tMap = this.edges.get(a[1])) tMap.delete(a[0]);
            } else {
                if (tMap = this.edges.get(a)) tMap.delete(b);
                if (tMap = this.edges.get(b)) tMap.delete(a);
            }

        }

    }

    window.EdgeSet = EdgeSet;

}(window));
