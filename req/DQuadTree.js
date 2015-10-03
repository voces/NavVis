//2 3
//1 0

//TODO: Finish .collapse

(function (window) {
    "use strict";
    
    function DQuadTree(density, parent, min, max) {
        this.density = density;
        this.parent = parent;
        
        this.contents = [];
        this.children = [];
        
        this.length = 0;
        
        this.x = null;
        this.y = null;
        this.min = {
            x: min ? (min.x || -Infinity) : -Infinity,
            y: min ? (min.y || -Infinity) : -Infinity
        };
        this.max = {
            x: max ? (max.x || Infinity) : Infinity,
            y: max ? (max.y || Infinity) : Infinity
        };
        
        this.id = parent ? parent.id : "_dquadtree" + DQuadTree.count++;
        
    }
    
    DQuadTree.count = 0;
    
    function clamp(value) {
        if (value > 10000) return 10000;
        if (value < -10000) return -10000;
        return value;
    }
    
    var colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet"];
    
    DQuadTree.prototype.printIds = function() {
        
        var i;
        
        if (this.contents)
            for (i = 0; i < this.contents.length; i++)
                console.log(this.contents[i].id, this.contents[i].colorName);
        
        else {
            this.children[0].printAll();
            this.children[1].printAll();
            this.children[2].printAll();
            this.children[3].printAll();
        }
        
    };
    
    DQuadTree.prototype.printAll = function() {
        
        var i;
        
        if (this.contents)
            for (i = 0; i < this.contents.length; i++) {
                console.log(this.contents[i].id, this.contents[i].colorName);
                polygonTrace(this.contents[i]);
            }
        else {
            this.children[0].printAll();
            this.children[1].printAll();
            this.children[2].printAll();
            this.children[3].printAll();
        }
        
    };
    
    DQuadTree.prototype.drawAll = function() {
        
        var i;
        
        if (this.contents)
            for (i = 0; i < this.contents.length; i++)
                new Drawing.Path(this.contents[i]).fill(this.contents[i].color).close().width(0).append().draw().temp();
        else {
            this.children[0].drawAll();
            this.children[1].drawAll();
            this.children[2].drawAll();
            this.children[3].drawAll();
        }
        
    };
    
    DQuadTree.prototype.graph = function() {
        
        var cells = [[this, 0]], cell;
        
        while (cell = cells.pop()) {
            if (cell[0].children.length !== 0) {
                
                drawSegment(
                    {x: cell[0].x, y: cell[0].y},
                    {x: cell[0].x, y: clamp(cell[0].min.y)},
                    colors[cell[1]], 16);
                drawSegment(
                    {x: cell[0].x, y: cell[0].y},
                    {x: cell[0].x, y: clamp(cell[0].max.y)},
                    colors[cell[1]], 16);
                drawSegment(
                    {x: cell[0].x, y: cell[0].y},
                    {x: clamp(cell[0].min.x), y: cell[0].y},
                    colors[cell[1]], 16);
                drawSegment(
                    {x: cell[0].x, y: cell[0].y},
                    {x: clamp(cell[0].max.x), y: cell[0].y},
                    colors[cell[1]], 16);
                
                cells.push(
                    [cell[0].children[0], cell[1] + 1],
                    [cell[0].children[1], cell[1] + 1],
                    [cell[0].children[2], cell[1] + 1],
                    [cell[0].children[3], cell[1] + 1]);
            }
            
        }
        
    };
    
    DQuadTree.prototype.push = function (item, noPropagate) {
        
        var cur, i;
        
        //We've reached density; empty the contents and spill into children
        if (this.contents && this.contents.length === this.density) {
            
            this.x = this.y = 0;
            
            //Calculate the average x/y of the cell
            for (i = 0; i < this.contents.length; i++) {
                this.x += this.contents[i].x;
                this.y += this.contents[i].y;
            }
            
            this.x /= this.contents.length;
            this.y /= this.contents.length;
            
            //Create four children cells (common intersection at the average, as treated below)
            this.children[0] = new DQuadTree(this.density, this, {x: this.x, y: this.y}, this.max);
            this.children[1] = new DQuadTree(this.density, this, {x: this.min.x, y: this.y}, {x: this.x, y: this.max.y});
            this.children[2] = new DQuadTree(this.density, this, this.min, {x: this.x, y: this.y});
            this.children[3] = new DQuadTree(this.density, this, {x: this.x, y: this.min.y}, {x: this.max.x, y: this.y});
            
            for (i = 0; i < this.contents.length; i++) {
                
                this.contents[i][this.id] = [];
                
                if (this.contents[i].x + this.contents[i].radius > this.x &&
                    this.contents[i].y + this.contents[i].radius > this.y)
                    this.children[0].push(this.contents[i], true);
                
                if (this.contents[i].x - this.contents[i].radius < this.x &&
                    this.contents[i].y + this.contents[i].radius > this.y)
                    this.children[1].push(this.contents[i], true);
                
                if (this.contents[i].x - this.contents[i].radius < this.x &&
                    this.contents[i].y - this.contents[i].radius < this.y)
                    this.children[2].push(this.contents[i], true);
                
                if (this.contents[i].x + this.contents[i].radius > this.x &&
                    this.contents[i].y - this.contents[i].radius < this.y)
                    this.children[3].push(this.contents[i], true);
                
            }
            
            this.contents = null;
            
        //No children, feed contents
        } else if (this.children.length === 0) {
            this.contents.push(item);
            
            if (item[this.id]) item[this.id].push(this);
            else item[this.id] = [this];
            
            this.length++;
            
            return this.contents.length;
        }
        
        //Feeds to a child; find them and push
        if (item.x + item.radius > this.x && item.y + item.radius > this.y)
            this.children[0].push(item);
        if (item.x - item.radius < this.x && item.y + item.radius > this.y)
            this.children[1].push(item);
        if (item.x - item.radius < this.x && item.y - item.radius < this.y)
            this.children[2].push(item);
        if (item.x + item.radius > this.x && item.y - item.radius < this.y)
            this.children[3].push(item);
        
        //Increase our length
        this.length++;
        
    };
    
    DQuadTree.prototype.remove = function (element) {
        
        var index, cur,
            
            removedList = [],
            
            i;
        
        if (typeof element[this.id] !== "undefined") {// && (index = element.cell.contents.indexOf(element)) >= 0) {
            
            for (i = 0; i < element[this.id].length; i++) {
                index = element[this.id][i].contents.indexOf(element);
                
                cur = element[this.id][i];
                while (cur && removedList.indexOf(cur) === -1) {
                    cur.length--;
                    removedList.push(cur);
                    
                    cur = cur.parent;
                }
                
                element[this.id][i].contents.splice(index, 1);
                
                if (element[this.id][i].parent && element[this.id][i].parent.length < element[this.id][i].density)
                    element[this.id][i].parents[i].collapse();
                
            }
            
            element[this.id] = undefined;
        }
        
    };
    
    DQuadTree.prototype.collapse = function () {
        console.log("DQuadTree.collapse not written!")
    };
    
    DQuadTree.prototype.queryPoint = function* (x, y, radius) {
        
        //Start off the cells with the superstructure
        var cells = [this], cell;
        
        //Loop while non-empty
        /* jshint -W084 */
        while (cell = cells.pop()) {
            
            //No children; return self
            if (cell.children.length === 0)
                yield cell.contents;
            
            //We have children; add them to cells and try again
            else {
                
                if (x - radius >= cell.x && y - radius >= cell.y) cells.push(cell.children[0]);
                if (x - radius <= cell.x && y - radius >= cell.y) cells.push(cell.children[1]);
                if (x - radius <= cell.x && y - radius <= cell.y) cells.push(cell.children[2]);
                if (x - radius >= cell.x && y - radius <= cell.y) cells.push(cell.children[3]);
                
            }
            
        }
        
    };
    
    DQuadTree.prototype.queryRange = function* (minX, minY, maxX, maxY, radius) {
        
        //Start off the cells with the superstructure
        var cells = [this], cell;
        
        //Loop while non-empty
        /* jshint -W084 */
        while (cell = cells.pop()) {
            
            //No children; return self
            if (cell.children.length === 0)
                yield cell.contents;
            
            //We have children; add them to cells and try again
            else {
                
                if (maxX + radius >= cell.x && maxY + radius >= cell.y) cells.push(cell.children[0]);
                if (minX - radius <= cell.x && maxY + radius >= cell.y) cells.push(cell.children[1]);
                if (minX - radius <= cell.x && minY - radius <= cell.y) cells.push(cell.children[2]);
                if (maxX + radius >= cell.x && minY - radius <= cell.y) cells.push(cell.children[3]);
                
            }
            
        }
        
    };
    
    /* jshint -W084 */
    DQuadTree.prototype.queryLine = function* (x1, y1, x2, y2) {
        
        var lineAngle, testAngle,
            
            cells = [this], cell;
        
        lineAngle = Math.atan2(y2 - y1, x2 - x1);
        
        //Going down towards the right
        if (lineAngle >= 0 && lineAngle <= Math.PI / 2) {
            
            while (cell = cells.pop()) {
                
                //No children, give it
                if (cell.children.length === 0) {
                    if (cell.contents.length)
                        yield cell.contents;
                
                //Children, push those that apply (with the nearest pushed last)
                } else {
                    
                    testAngle = Math.atan2(cell.y - y1, cell.x - x1);
                    
                    //Bottom right
                    if (x2 >= cell.x && y2 >= cell.y &&
                        Geo.inclusiveBetween(lineAngle, Math.atan2(cell.y - y1, cell.max.x - x1), Math.atan2(cell.max.y - y1, cell.x - x1)))
                        cells.push(cell.children[0]);
                    
                    //Top right
                    if (x2 >= cell.x && lineAngle <= testAngle || y1 <= cell.y)
                        cells.push(cell.children[3]);
                    
                    //Bottom left
                    if (y2 >= cell.y && lineAngle >= testAngle || x1 <= cell.x)
                        cells.push(cell.children[1]);
                    
                    //Top left
                    if (x1 <= cell.x && y1 <= cell.y &&
                        Geo.inclusiveBetween(lineAngle, Math.atan2(cell.min.y - y1, cell.x - x1), Math.atan2(cell.y - y1, cell.min.x - x1)))
                        cells.push(cell.children[2]);
                    
                }
                
            }
        
        //Going down towards the left
        } else if (lineAngle >= Math.PI / 2 && lineAngle <= Math.PI) {
            
            while (cell = cells.pop()) {
                
                //No children, give it
                if (cell.children.length === 0) {
                    if (cell.contents.length)
                        yield cell.contents;
                
                //Children, push those that apply (with the nearest pushed last)
                } else {
                    
                    testAngle = Math.atan2(cell.y - y1, cell.x - x1);
                    
                    //Bottom left
                    if (x2 <= cell.x && y2 >= cell.y &&
                        Geo.inclusiveBetween(lineAngle, Math.atan2(cell.max.y - y1, cell.x - x1), Math.atan2(cell.y - y1, cell.min.x - x1)))
                        cells.push(cell.children[1]);
                    
                    //Top left
                    if (x2 <= cell.x && lineAngle >= testAngle || y1 <= cell.y)
                        cells.push(cell.children[2]);
                    
                    //Bottom right
                    if (y2 >= cell.y && lineAngle <= testAngle || x1 >= cell.x)
                        cells.push(cell.children[0]);
                    
                    //Top right
                    if (x1 >= cell.x && y1 <= cell.y &&
                        Geo.inclusiveBetween(lineAngle, Math.atan2(cell.y - y1, cell.max.x - x1), Math.atan2(cell.min.y - y1, cell.x - x1)))
                        cells.push(cell.children[3]);
                    
                }
                
            }
        
        //Going up towards the left
        } else if (lineAngle >= -Math.PI && lineAngle <= Math.PI / -2) {
            
            while (cell = cells.pop()) {
                
                //No children, give it
                if (cell.children.length === 0) {
                    if (cell.contents.length)
                        yield cell.contents;
                
                //Children, push those that apply (with the nearest pushed last)
                } else {
                    
                    testAngle = Math.atan2(cell.y - y1, cell.x - x1);
                    
                    //Top left
                    if (x2 <= cell.x && y2 <= cell.y &&
                        Geo.inclusiveBetween(lineAngle, Math.atan2(cell.y - y1, cell.min.x - x1), Math.atan2(cell.min.y - y1, cell.x - x1)))
                        cells.push(cell.children[2]);
                    
                    //Top right
                    if (y2 <= cell.y && lineAngle >= testAngle || x1 >= cell.x)
                        cells.push(cell.children[3]);
                    
                    //Bottom left
                    if (x2 <= cell.x && lineAngle <= testAngle || y1 >= cell.y)
                        cells.push(cell.children[1]);
                    
                    //Bottom right
                    if (x1 >= cell.x && y1 >= cell.y &&
                        Geo.inclusiveBetween(lineAngle, Math.atan2(cell.max.y - y1, cell.x - x1), Math.atan2(cell.y - y1, cell.max.x - x1)))
                        cells.push(cell.children[0]);
                    
                }
                
            }
        
        //Going up towards the right
        } else if (lineAngle >= Math.PI / -2 && lineAngle <= 0) {
            
            while (cell = cells.pop()) {
                
                //No children, give it
                if (cell.children.length === 0) {
                    if (cell.contents.length)
                        yield cell.contents;
                
                //Children, push those that apply (with the nearest pushed last)
                } else {
                    
                    testAngle = Math.atan2(cell.y - y1, cell.x - x1);
                    
                    //Top right
                    if (x2 >= cell.x && y2 <= cell.y &&
                        Geo.inclusiveBetween(lineAngle, Math.atan2(cell.min.y - y1, cell.x - x1), Math.atan2(cell.y - y1, cell.max.x - x1)))
                        cells.push(cell.children[3]);
                    
                    //Top left
                    if (y2 <= cell.y && lineAngle <= testAngle || x1 <= cell.x)
                        cells.push(cell.children[2]);
                    
                    //Bottom right
                    if (x2 >= cell.x && lineAngle >= testAngle || y1 >= cell.y)
                        cells.push(cell.children[0]);
                    
                    //Bottom left
                    if (x1 <= cell.x && y1 >= cell.y &&
                        Geo.inclusiveBetween(lineAngle, Math.atan2(cell.y - y1, cell.min.x - x1), Math.atan2(cell.max.y - y1, cell.x - x1)))
                        cells.push(cell.children[1]);
                    
                }
                
            }
        
        }
        
    };
    
    window.DQuadTree = DQuadTree;
    
}(window));
