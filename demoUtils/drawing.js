
(function () {
    "use strict";

    const nativeToString = {}.toString;

    let onAdd = [],
        onRemove = [],
        onChange = [],

        svg,

        defaultParent,

        currentPath = null, snapPoint = null,

        elements = [];

    function defaultToString() {
        return this.x + "," + this.y;
    }

    class Element {

        constructor() {

            this.element = null;
            elements.push(this);

            this.parent = defaultParent;

        }

        append() {
            if (this.element) this.parent.appendChild(this.element);

            return this;
        }

        detach() {
            if (this.element && this.element.parentNode instanceof SVGElement) this.parent.removeChild(this.element);

            return this;
        }

        stroke(color) {
            if (this.element) this.element.setAttribute("stroke", color);

            return this;
        }

        dashed(dashDetails) {
            if (this.element) this.element.setAttribute("stroke-dasharray", dashDetails);

            return this;
        }

        fill(color) {
            if (this.element) this.element.setAttribute("fill", color);

            return this;
        }

        width(width) {
            if (this.element) this.element.setAttribute("stroke-width", width);

            return this;
        }

        layer(parent) {

            if (this.element && this.element.parentNode instanceof SVGElement) {

                this.parent.removeChild(this.element);
                this.parent = parent;
                this.parent.appendChild(this.element);

            } else this.parent = parent;

            return this;

        }

    }

    class Layer extends Element {

        constructor(x, y, parent) {
            super();

            this.x = x || 0;
            this.y = y || 0;

            this.element = document.createElementNS("http://www.w3.org/2000/svg", "g");
            this.element.obj = this;

            this.element.setAttribute("x", x);
            this.element.setAttribute("y", y);

            if (parent) this.parent = parent;

        }

        append() {
            if (this.element) this.parent.appendChild(this.element);

            return this;
        }

        detach() {
            if (this.element && this.element.parentNode instanceof SVGElement) this.parent.removeChild(this.element);

            return this;
        }

        appendChild(element) {
            if (this.element) this.element.appendChild(element);

            return this;
        }

        removeChild(element) {
            if (this.element) this.element.removeChild(element);

            return this;
        }

    }

    class Point extends Element {

        constructor(x, y, color) {
            super();

            this.x = x;
            this.y = y;

            this.radius = 5;

            this.element = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            this.element.obj = this;

            this.element.setAttribute("r", 5);
            this.element.setAttribute("cx", x);
            this.element.setAttribute("cy", y);

            if (color) this.element.style.fill = color;
        }

        radius(value) {
            this.radius = value;
            this.element.setAttribute("r", this.radius);
        }

        draw(x, y) {

            if (typeof x !== "undefined") this.x = x;
            if (typeof y !== "undefined") this.y = y;

            this.element.setAttribute("cx", this.x);
            this.element.setAttribute("cy", this.y);
        }

        toString() {
            return this.x + ", " + this.y;
        }

        distanceToPoint(point) {
            let deltaX = this.x - point.x,
                deltaY = this.y - point.y;

            return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        }



    }

    class Arc extends Element {

        constructor(x, y, left, right, r) {
            super();

            this.x = x;
            this.y = y;
            this.left = left;
            this.right = right;
            this.ori = Math.abs((this.right - this.left) % (Math.PI * 2)) < Math.PI ? 0 : 1;

            this.radius = r || 25;

            this.element = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this.element.obj = this;

            this.element.setAttribute("stroke", "black");
            this.element.setAttribute("stroke-width", "2");
            this.element.setAttribute("fill", "none");

            this.draw();
        }

        draw() {

            // console.log(this.x, this.y, this.left, this.right, this.radius);
            // console.log((this.x + this.radius * Math.cos(this.left)), (this.y + this.radius * Math.sin(this.left)));
            //console.log((this.x + this.radius * Math.cos(this.right)), (this.y + this.radius * Math.sin(this.right)));

            this.element.setAttribute("d", "M " + (this.x + this.radius * Math.cos(this.left)) + " " +
                                                  (this.y + this.radius * Math.sin(this.left)) +
                                                  " A " + this.radius + " " + this.radius + " 0 " + this.ori + " 0 " +
                                                  (this.x + this.radius * Math.cos(this.right)) + " " +
                                                  (this.y + this.radius * Math.sin(this.right)));

            return this;

        }

    }

    class Path extends Element {

        constructor(footprint) {
            super();

            this.footprint = footprint;
            this.ended = false;

            this.element = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this.element.obj = this;

            for (let i = 0; i < this.footprint.length; i++)
                if (this.footprint[i].toString === {}.toString)
                    this.footprint[i].toString = defaultToString;

            this.element.setAttribute("stroke", "black");
            this.element.setAttribute("stroke-width", "3");
            this.element.setAttribute("fill", "rgba(0, 0, 0, 0.1)");
            this.draw();
        }

        close() {
            this.ended = true;

            return this;
        }

        draw() {
            this.element.setAttribute("d", "M " + this.footprint.join(" L ") + (this.ended ? "Z" : ""));

            return this;
        }

    }

    class Line extends Element {

        constructor(start, end) {
            super();

            this.start = start;
            this.end = end;

            this.element = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this.element.obj = this;

            this.element.setAttribute("stroke", "black");
            this.element.setAttribute("stroke-width", "3");
            this.draw();
        }

        draw() {
            this.element.setAttribute("d", "M" +
                                      this.start.x + " " + this.start.y + " L " +
                                      this.end.x + " " + this.end.y);

            return this;
        }

    }

    class Text extends Element {

        constructor(text, x, y) {
            super();

            if (typeof x === "undefined") x = window.innerWidth / 2;
            if (typeof y === "undefined") y = window.innerHeight / 2;

            this.element = document.createElementNS("http://www.w3.org/2000/svg", "text");

            this.element.textContent = text;

            this.append();

            let bounds = this.element.getBoundingClientRect();

            this.element.setAttribute("x", x - bounds.width / 2);
            this.element.setAttribute("y", y + bounds.height / 2);

            this.detach();

        }

    }

    function clear() {
        for (let i = 0; i < elements.length; i++)
            elements[i].detach();

        elements = [];
    }

    function svgDown(e) {

        if (currentPath) {

            if (snapPoint) currentPath.live = false;

            else {

                let point = new Point(e.pageX, e.pageY).append();

                currentPath.footprint.splice(currentPath.footprint.length - 1, 0, point);
                currentPath.draw();

            }

            for (let i = 0; i < onAdd.length; i++)
                onChange[i](currentPath);

        } else if (e.target === svg) {

            currentPath = new Path([
                new Point(e.pageX, e.pageY).append(),
                new Point(e.pageX, e.pageY).append()
            ]).close().draw().append();

            currentPath.live = true;

            for (let i = 0; i < onAdd.length; i++)
                onAdd[i](currentPath);

        }

    }

    function svgUp(e) {

        if (!currentPath) {

            currentPath = new Path([
                new Point(e.pageX, e.pageY).append(),
                new Point(e.pageX, e.pageY).append()
            ]).close().draw().append();

            currentPath.live = true;

            for (let i = 0; i < onAdd.length; i++)
                onAdd[i](currentPath);

        } else if (!currentPath.live) {

            currentPath = null;
            snapPoint = null;

        }

    }

    function distanceBetweenPoints(a, b) {

        return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));

    }

    function svgMove(e) {

        if (currentPath && currentPath.live) {

            let distance = distanceBetweenPoints(currentPath.footprint[0], {x: e.pageX, y: e.pageY});

            if (distance < 16) {

                if (snapPoint) return;

                snapPoint = currentPath.footprint.splice(currentPath.footprint.length - 1, 1)[0].detach();

                currentPath.draw();

            } else {

                if (snapPoint) {

                    currentPath.footprint.push(snapPoint.append());
                    snapPoint = 0;

                }

                currentPath.footprint[currentPath.footprint.length - 1].draw(e.pageX, e.pageY);
                currentPath.draw();

            }

            for (let i = 0; i < onAdd.length; i++)
                onChange[i](currentPath);

        }

    }

    document.addEventListener("DOMContentLoaded", function () {

        svg = document.getElementById("svg");
        defaultParent = svg;

        svg.addEventListener("mousedown", svgDown);
        svg.addEventListener("mouseup", svgUp);
        svg.addEventListener("mousemove", svgMove);
        window.oncontextmenu = function () {
            return false;
        };

    });

    window.drawing = {
        onAdd: onAdd,
        onRemove: onRemove,
        onChange: onChange,
        Point: Point,
        Element: Element,
        Layer: Layer,
        Path: Path,
        Line: Line,
        Text: Text,
        Arc: Arc,
        clear: clear,
        setDefaultParent: newParent => defaultParent = newParent
    };

    Object.defineProperty(window.drawing, "svg", {
        get: () => svg
    });

}(window));
