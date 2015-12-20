
(function () {
    "use strict";

    let onAdd = [],
        onRemove = [],
        onChange = [],

        svg,

        tempStuff = [],

        movingLine = null,
        currentPath = null,

        elements = [],

        moving = false, currentTarget = null;

    class Element {

        constructor() {
            this.element = null;
            elements.push(this);
        }

        append() {
            if (this.element) svg.appendChild(this.element);

            return this;
        }

        detach() {
            if (this.element && this.element.parentNode === svg) svg.removeChild(this.element);

            return this;
        }

        temp() {
            tempStuff.push(this);

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

        draw() {
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

    class Path extends Element {

        constructor(footprint) {
            super();

            this.footprint = footprint;
            this.ended = false;

            this.element = document.createElementNS("http://www.w3.org/2000/svg", "path");
            this.element.obj = this;

            this.element.setAttribute("stroke", "black");
            this.element.setAttribute("stroke-width", "3");
            this.element.setAttribute("fill", "rgba(0, 0, 0, 0.1");
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

            this.element = document.createElementNS("http://www.w3.org/2000/svg", "text");

            this.element.textContent = text;

            this.append();

            this.element.setAttribute("x", (x || window.innerWidth / 2) - this.element.offsetWidth / 2);
            this.element.setAttribute("y", (y || window.innerHeight / 2) + this.element.offsetHeight / 2);

            this.detach();

        }

    }

    function clearTemp() {

        for (let i = 0; i < tempStuff.length; i++)
            tempStuff[i].detach();
            //if (typeof tempStuff[i] === "object" && tempStuff[i] instanceof Path) tempStuff[i].detach();

        tempStuff = [];

    }

    function clear() {
        for (let i = 0; i < elements.length; i++)
            elements[i].detach();

        elements = [];
    }

    function svgDown(e) {
        if (e.target === svg) return;
        if (e.button !== 0) return;
        if (e.target.classList.contains("draggable")) return;

        currentTarget = e.target.obj || e.target;

        e.stopPropagation();
        e.preventDefault();
    }

    function svgUp(e) {

        if (e.target.classList.contains("draggable")) return;

        if (e.button !== 0) {
            for (let i = 0; i < onAdd.length; i++)
                onAdd[i](new Path([
                    new Point(e.clientX - 25, e.clientY + 25).append(),
                    new Point(e.clientX - 25, e.clientY - 25).append(),
                    new Point(e.clientX + 25, e.clientY - 25).append(),
                    new Point(e.clientX + 25, e.clientY + 25).append()
                ]).close().draw().append());

            return;
        }

        if (!moving)

            if (currentTarget === null || currentPath !== null) {
                let point = new Point(e.clientX, e.clientY);

                if (currentPath === null) {
                    currentPath = new Path([point]).draw().append();
                    window.currentPath = currentPath;
                    movingLine = new Line(point, point).append();

                    point.path = currentPath;

                    point.append();

                } else if (point.distanceToPoint(currentPath.footprint[0]) < 16) {

                    currentPath.ended = true;
                    currentPath.draw();

                    for (let i = 0; i < onAdd.length; i++)
                        onAdd[i](currentPath);

                    currentPath = null;

                    movingLine.detach();
                    movingLine = null;

                } else {
                    currentPath.footprint.push(point);
                    currentPath.draw();

                    point.path = currentPath;

                    point.append();

                }

            } else if (currentTarget instanceof Point)

                //Point is part of a path
                if (currentTarget.path) {

                    currentTarget.detach();
                    currentTarget.path.footprint.splice(currentTarget.path.footprint.indexOf(currentTarget), 1);

                    if (currentTarget.path.footprint.length === 2) {
                        currentTarget.path.ended = false;

                        currentTarget.path.draw();

                        for (let i = 0; i < onChange.length; i++)
                            onChange[i](currentTarget);

                    } else if (currentTarget.path.footprint.length === 1) {
                        currentTarget.path.detach();

                        for (let i = 0; i < onChange.length; i++)
                            onChange[i](currentTarget);

                        currentTarget.path.footprint[0].path = null;

                    } else {
                        currentTarget.path.draw();

                        for (let i = 0; i < onChange.length; i++)
                            onChange[i](currentTarget);
                    }

                } else {
                    for (let i = 0; i < onRemove.length; i++)
                        onRemove[i](currentTarget);

                    currentTarget.detach();
                }

            else if (currentTarget instanceof Path)

                if (e.timeStamp - currentTarget.lastClick < 300) {
                    for (let i = 0; i < currentTarget.footprint.length; i++) {
                        currentTarget.footprint[i].detach();
                        currentTarget.footprint[i].path = null;
                    }

                    for (let i = 0; i < onRemove.length; i++)
                        onRemove[i](currentTarget);

                    currentTarget.detach();
                } else currentTarget.lastClick = e.timeStamp;

        moving = false;
        currentTarget = null;
    }

    function svgMove(e) {

        if (e.target.classList.contains("draggable")) return;

        if (currentPath !== null) {
            movingLine.end = {x: e.clientX, y: e.clientY};
            movingLine.draw();

            return;

        }

        if (currentTarget !== null) {

            moving = true;

            if (currentTarget instanceof Point) {
                currentTarget.x = e.clientX;
                currentTarget.y = e.clientY;
                currentTarget.draw();

                if (currentTarget.path) {
                    currentTarget.path.draw();

                    for (let i = 0; i < onChange.length; i++)
                        onChange[i](currentTarget.path);

                } else for (let i = 0; i < onChange.length; i++) onChange[i](currentTarget);

            } else if (currentTarget instanceof Path) {
                for (let i = 0; i < currentTarget.footprint.length; i++) {
                    currentTarget.footprint[i].x += e.movementX;
                    currentTarget.footprint[i].y += e.movementY;
                    currentTarget.footprint[i].draw();
                }

                currentTarget.draw();

                for (let i = 0; i < onChange.length; i++)
                    onChange[i](currentTarget);

            }

        }

    }

    document.addEventListener("DOMContentLoaded", function () {

        svg = document.getElementById("svg");

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
        Path: Path,
        Line: Line,
        Text: Text,
        clearTemp: clearTemp,
        clear: clear
    };

}(window));
