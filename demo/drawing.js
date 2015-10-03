
(function () {
    "use strict";
    
    var onAdd = [],
        onRemove = [],
        onChange = [],
        
        svg,
        
        tempStuff = [],
        
        movingLine = null,
        currentPath = null,
        
        moving = false, currentTarget = null;
    
    function Point(x, y, color) {
        this.x = x;
        this.y = y;
        
        this.circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        this.circle.obj = this;
        
        this.circle.setAttribute("r", 5);
        this.circle.setAttribute("cx", x);
        this.circle.setAttribute("cy", y);
        
        if (color) this.circle.style.fill = color;
        
        //this.circle.addEventListener("click", this.onClick.bind(this));
    }
    
    Point.prototype.data = function(data) {
        this.circle.setAttribute("data", data);
        return this;
    };
    
    Point.prototype.draw = function () {
        this.circle.setAttribute("cx", this.x);
        this.circle.setAttribute("cy", this.y);
    };
    
    Point.prototype.append = function () {
        svg.appendChild(this.circle);
        
        return this;
    };
    
    Point.prototype.detach = function () {
        svg.removeChild(this.circle);
        
        return this;
    };
    
    Point.prototype.toString = function () {
        return this.x + ", " + this.y;
    };
    
    Point.prototype.distanceToPoint = function (point) {
        var deltaX = this.x - point.x,
            deltaY = this.y - point.y;
        
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    };
    
    function Path(footprint) {
        this.footprint = footprint;
        this.ended = false;
        
        this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.path.obj = this;
        
        this.path.setAttribute("stroke", "black");
        this.path.setAttribute("stroke-width", "3");
        this.path.setAttribute("fill", "rgba(0, 0, 0, 0.1");
        this.draw();
    }
    
    Path.prototype.close = function () {
        this.ended = true;
        
        return this;
    };
    
    Path.prototype.append = function () {
        svg.appendChild(this.path);
        
        return this;
    };
    
    Path.prototype.detach = function () {
        svg.removeChild(this.path);
        
        return this;
    };
    
    Path.prototype.width = function (width) {
        this.path.setAttribute("stroke-width", width);
        
        return this;
    };
    
    Path.prototype.draw = function () {
        this.path.setAttribute("d", "M " + this.footprint.join(" L ") + (this.ended ? "Z" : ""));
        
        return this;
    };
    
    Path.prototype.fill = function(color) {
        this.path.setAttribute("fill", color);
        
        return this;
    };
    
    Path.prototype.color = function (color) {
        this.path.setAttribute("stroke", color);
        
        return this;
    };
    
    Path.prototype.temp = function() {
        tempStuff.push(this);
    };
    
    function Line(start, end) {
        this.start = start;
        this.end = end;
        
        this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.path.obj = this;
        
        this.path.setAttribute("stroke", "black");
        this.path.setAttribute("stroke-width", "3");
        this.draw();
    }
    
    Line.prototype.color = function (color) {
        this.path.setAttribute("stroke", color);
        
        return this;
    };
    
    Line.prototype.append = function () {
        svg.appendChild(this.path);
        
        return this;
    };
    
    Line.prototype.detach = function () {
        svg.removeChild(this.path);
        
        return this;
    };
    
    Line.prototype.draw = function () {
        this.path.setAttribute("d", "M" + this.start.x + " " + this.start.y + " L " + this.end.x + " " + this.end.y);
        
        return this;
    };
    
    Line.prototype.width = function (width) {
        this.path.setAttribute("stroke-width", width);
        
        return this;
    };
    
    function clearTemp() {
        
        var i;
        
        for (i = 0; i < tempStuff.length; i++)
            if (typeof tempStuff[i] === "object" && tempStuff[i] instanceof Path) tempStuff[i].detach();
        
        tempStuff = [];
        
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
        
        var point,
            
            i;
        
        if (e.target.classList.contains("draggable")) return;
        
        if (e.button !== 0) {
            for (i = 0; i < onAdd.length; i++)
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
                point = new Point(e.clientX, e.clientY);

                if (currentPath === null) {
                    currentPath = new Path([point]).draw().append();
                    window.currentPath = currentPath;
                    movingLine = new Line(point, point).append();

                    point.path = currentPath;

                    point.append();

                } else if (point.distanceToPoint(currentPath.footprint[0]) < 16) {

                    currentPath.ended = true;
                    currentPath.draw();
                    
                    for (i = 0; i < onAdd.length; i++)
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
                        
                        for (i = 0; i < onChange.length; i++)
                            onChange[i](currentTarget.path);
                        
                    } else if (currentTarget.path.footprint.length === 1) {
                        currentTarget.path.detach();
                        
                        for (i = 0; i < onChange.length; i++)
                            onChange[i](currentTarget.path);
                        
                        currentTarget.path.footprint[0].path = null;
                        
                    } else {
                        currentTarget.path.draw();
                        
                        for (i = 0; i < onChange.length; i++)
                            onChange[i](currentTarget.path);
                    }
                    
                } else {
                    for (i = 0; i < onRemove.length; i++)
                        onRemove[i](currentTarget);
                    
                    currentTarget.detach();
                }
                
            else if (currentTarget instanceof Path)
                
                if (e.timeStamp - currentTarget.lastClick < 300) {
                    for (i = 0; i < currentTarget.footprint.length; i++) {
                        currentTarget.footprint[i].detach();
                        currentTarget.footprint[i].path = null;
                    }
                    
                    for (i = 0; i < onRemove.length; i++)
                        onRemove[i](currentTarget);
                    
                    currentTarget.detach();
                } else currentTarget.lastClick = e.timeStamp;
            
        moving = false;
        currentTarget = null;
    }
    
    function svgMove(e) {
        
        var i;
        
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
                    
                    for (i = 0; i < onChange.length; i++)
                        onChange[i](currentTarget.path);
                } else
                    for (i = 0; i < onChange.length; i++)
                        onChange[i](currentTarget);
                
            } else if (currentTarget instanceof Path) {
                for (i = 0; i < currentTarget.footprint.length; i++) {
                    currentTarget.footprint[i].x += e.movementX;
                    currentTarget.footprint[i].y += e.movementY;
                    currentTarget.footprint[i].draw();
                }
                
                currentTarget.draw();
                
                for (i = 0; i < onChange.length; i++)
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
    
    window.Drawing = {
        onAdd: onAdd,
        onRemove: onRemove,
        onChange: onChange,
        Point: Point,
        Path: Path,
        Line: Line,
        clearTemp: clearTemp
    };
    
}(window));

