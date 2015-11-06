//2 3
//1 0

(function (window) {
    "use strict";

    let drawing = window.drawing,
        geo = window.geo,
        direction = window.direction,
        pointListToString = window.pointListToString;

    function DQuadTree(density, parent, min, max, quadrant) {
        this.density = density || 10;
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

        this.sharedMin = {x: this.min.x, y: this.min.y};
        this.sharedMax = {x: this.max.x, y: this.max.y};

        this.id = parent ? parent.id : "_dquadtree" + DQuadTree.count++;
        this.uniqid = parent ? parent.uniqid + quadrant : "";

    }

    DQuadTree.count = 0;

    function clamp(value) {
        if (value > 10000) return 10000;
        if (value < -10000) return -10000;
        return value;
    }

    let colors = ["red", "orange", "yellow", "green", "blue", "indigo", "violet",
                  "red", "orange", "yellow", "green", "blue", "indigo", "violet",
                  "red", "orange", "yellow", "green", "blue", "indigo", "violet"];

    /*eslint-disable no-console*/
    DQuadTree.prototype.printIds = function() {

        let i;

        if (this.contents) for (i = 0; i < this.contents.length; i++)
            console.log(this.contents[i].id, this.contents[i].colorName);

        else {
            this.children[0].printIds();
            this.children[1].printIds();
            this.children[2].printIds();
            this.children[3].printIds();
        }

    };
    /*eslint-enable no-console*/

    /*eslint-disable no-console*/
    DQuadTree.prototype.printAll = function() {

        let i;

        if (this.contents) for (i = 0; i < this.contents.length; i++)
            console.log(this.contents[i].id, this.contents[i].colorName, direction(this.contents[i]),
                        pointListToString(this.contents[i]));
                //polygonTrace(this.contents[i]);

        else {
            this.children[0].printAll();
            this.children[1].printAll();
            this.children[2].printAll();
            this.children[3].printAll();
        }

    };
    /*eslint-enable no-console*/

    DQuadTree.prototype.drawAll = function() {

        let i;

        if (this.contents)
            for (i = 0; i < this.contents.length; i++) {
                //new drawing.Path(this.contents[i]).fill("#7f7").close().width(0).append().draw().temp();
                new drawing.Path(this.contents[i]).fill(this.contents[i].color).close().width(0).append().draw().temp();
                new drawing.Text(this.contents[i].id, this.contents[i].x, this.contents[i].y).append().temp();
            }
        else {
            this.children[0].drawAll();
            this.children[1].drawAll();
            this.children[2].drawAll();
            this.children[3].drawAll();
        }

    };

    DQuadTree.prototype.graph = function() {

        drawing.clearTemp();

        let cells = [[this, 0]], cell;

        while (cell = cells.pop())
            if (cell[0].children.length !== 0) {

                new drawing.Line(
                    {x: cell[0].x, y: cell[0].y},
                    {x: cell[0].x, y: clamp(cell[0].min.y)}).stroke(colors[cell[1]]).append().draw().temp();
                new drawing.Line(
                    {x: cell[0].x, y: cell[0].y},
                    {x: cell[0].x, y: clamp(cell[0].max.y)}).stroke(colors[cell[1]]).append().draw().temp();
                new drawing.Line(
                    {x: cell[0].x, y: cell[0].y},
                    {x: clamp(cell[0].min.x), y: cell[0].y}).stroke(colors[cell[1]]).append().draw().temp();
                new drawing.Line(
                    {x: cell[0].x, y: cell[0].y},
                    {x: clamp(cell[0].max.x), y: cell[0].y}).stroke(colors[cell[1]]).append().draw().temp();

                cells.push(
                    [cell[0].children[0], cell[1] + 1],
                    [cell[0].children[1], cell[1] + 1],
                    [cell[0].children[2], cell[1] + 1],
                    [cell[0].children[3], cell[1] + 1]);
            }

    };

    DQuadTree.prototype.clampX = function(x) {
        return Math.min(Math.max(x, this.min.x), this.max.x);
    };

    DQuadTree.prototype.clampY = function(y) {
        return Math.min(Math.max(y, this.min.y), this.max.y);
    };

    //TODO: NOTE: If item[this.id] contains this, simply return
    //              This isn't currently being done because NavMesh shouldn't even be sending a push...
    DQuadTree.prototype.push = function (item) {

        if (typeof item[this.id] !== "undefined") {
            let cur = this;

            while (cur && item[this.id].indexOf(cur) < 0)
                cur = cur.parent;

            if (cur) {
                console.log("DOUBLE PUSH", item);
                console.trace();
                return;
            }
        }

        //We've reached density; empty the contents and spill into children
        if (this.contents && this.contents.length >= this.density &&
            (this.sharedMax.x - this.sharedMin.x < -1e-7 || this.sharedMax.y - this.sharedMin.y < -1e-7)) {

            this.x = this.y = 0;

            //Calculate the sum x/y of the cell (clamp each value to the cell)
            for (let i = 0; i < this.contents.length; i++) {
                this.x += Math.min(Math.max(this.contents[i].x, this.min.x), this.max.x);
                this.y += Math.min(Math.max(this.contents[i].y, this.min.y), this.max.y);
            }

            //Turn that sum into an average
            this.x /= this.contents.length;
            this.y /= this.contents.length;

            //Create four children cells (common intersection at the average, as treated below)
            this.children[0] = new DQuadTree(this.density, this, {x: this.x, y: this.y},
                                             this.max, 0);
            this.children[1] = new DQuadTree(this.density, this, {x: this.min.x, y: this.y},
                                             {x: this.x, y: this.max.y}, 1);
            this.children[2] = new DQuadTree(this.density, this, this.min,
                                             {x: this.x, y: this.y}, 2);
            this.children[3] = new DQuadTree(this.density, this, {x: this.x, y: this.min.y},
                                             {x: this.max.x, y: this.y}, 3);

            //Loop through all the contents and push them onto the new children
            for (let i = 0; i < this.contents.length; i++) {

                this.contents[i][this.id].splice(this.contents[i][this.id].indexOf(this), 1);

                if (this.contents[i].max.x > this.x &&
                    this.contents[i].max.y > this.y)
                    this.children[0].push(this.contents[i]);

                if (this.contents[i].min.x < this.x &&
                    this.contents[i].max.y > this.y)
                    this.children[1].push(this.contents[i]);

                if (this.contents[i].min.x < this.x &&
                    this.contents[i].min.y < this.y)
                    this.children[2].push(this.contents[i]);

                if (this.contents[i].max.x > this.x &&
                    this.contents[i].min.y < this.y)
                    this.children[3].push(this.contents[i]);

            }

            this.contents = undefined;

        //We're not full; add to our own contents
        } else if (this.children.length === 0) {

            //First, update the shared space (used for detecting stacking)
            if (item.min.x > this.sharedMin.x) this.sharedMin.x = item.min.x;
            if (item.min.y > this.sharedMin.y) this.sharedMin.y = item.min.y;
            if (item.max.x < this.sharedMax.x) this.sharedMax.x = item.max.x;
            if (item.max.y < this.sharedMax.y) this.sharedMax.y = item.max.y;

            //Add to our contents
            this.contents.push(item);

            //Add ourselves as a cell holding the item
            if (item[this.id]) item[this.id].push(this);
            else item[this.id] = [this];

            ///Increase our length
            this.length++;

            return;
        }

        //Feeds to a child; find them and push
        if (item.max.x > this.x && item.max.y > this.y)
            this.children[0].push(item);
        if (item.min.x < this.x && item.max.y > this.y)
            this.children[1].push(item);
        if (item.min.x < this.x && item.min.y < this.y)
            this.children[2].push(item);
        if (item.max.x > this.x && item.min.y < this.y)
            this.children[3].push(item);

        //Increase our length
        this.length++;

    };

    DQuadTree.prototype.remove = function (element) {

        let index, cur,

            removedList = [];

        if (typeof element[this.id] !== "undefined") {// && (index = element.cell.contents.indexOf(element)) >= 0) {

            for (let i = 0; i < element[this.id].length; i++) {

                index = element[this.id][i].contents.indexOf(element);

                cur = element[this.id][i];
                while (cur && removedList.indexOf(cur) === -1) {
                    cur.length--;
                    removedList.push(cur);

                    cur = cur.parent;
                }

                element[this.id][i].contents.splice(index, 1);

            }

            for (let i = 0; i < element[this.id].length; i++)
                if (element[this.id][i].contents && element[this.id][i].parent &&
                    element[this.id][i].parent.length * 1.25 < element[this.id][i].density)

                    element[this.id][i].parent.collapse();

            element[this.id] = undefined;

        }

        this.graph();

    };

    DQuadTree.prototype.collapse = function () {

        //Restore the cell as if it was new
        this.contents = [];
        this.sharedMin = {x: this.min.x, y: this.min.y};
        this.sharedMax = {x: this.max.x, y: this.max.y};
        this.length = 0;
        this.x = null;
        this.y = null;

        //Reset the children to empty
        let children = this.children;
        this.children = [];

        //Push the contents of all children to this
        for (let i = 0; i < 4; i++) {
            for (let n = 0; n < children[i].contents.length; n++) {

                let index = children[i].contents[n][this.id].indexOf(children[i]);
                if (index >= 0) children[i].contents[n][this.id].splice(index, 1);

                if (children[i].contents[n][this.id].indexOf(this) < 0)
                    this.push(children[i].contents[n]);

            }

            children[i].contents = undefined;
        }

    };

    DQuadTree.prototype.queryPoint = function* (x, y, radius) {

        //Start off the cells with the superstructure
        let cells = [this], cell;

        //Loop while non-empty
        /* jshint -W084 */
        while (cell = cells.pop())

            //We have children; add them to cells and try again
            if (cell.children.length > 0) {
                if (x - radius >= cell.x && y - radius >= cell.y) cells.push(cell.children[0]);
                if (x - radius <= cell.x && y - radius >= cell.y) cells.push(cell.children[1]);
                if (x - radius <= cell.x && y - radius <= cell.y) cells.push(cell.children[2]);
                if (x - radius >= cell.x && y - radius <= cell.y) cells.push(cell.children[3]);

            //No children; return self
            } else yield cell.contents;

    };

    DQuadTree.prototype.queryRange = function* (minX, minY, maxX, maxY, radius) {

        //Start off the cells with the superstructure
        let cells = [this], cell;

        //Loop while non-empty
        /* jshint -W084 */
        while (cell = cells.pop())

            //We have children; add them to cells and try again
            if (cell.children.length > 0) {
                if (maxX + radius >= cell.x && maxY + radius >= cell.y) cells.push(cell.children[0]);
                if (minX - radius <= cell.x && maxY + radius >= cell.y) cells.push(cell.children[1]);
                if (minX - radius <= cell.x && minY - radius <= cell.y) cells.push(cell.children[2]);
                if (maxX + radius >= cell.x && minY - radius <= cell.y) cells.push(cell.children[3]);

            //No children; return self
            } else yield cell.contents;

    };

    /* jshint -W084 */
    DQuadTree.prototype.queryLine = function* (x1, y1, x2, y2) {

        let lineAngle, testAngle,

            cells = [this], cell;

        lineAngle = Math.atan2(y2 - y1, x2 - x1);

        //Going down towards the right
        if (lineAngle >= 0 && lineAngle <= Math.PI / 2)

            while (cell = cells.pop())

                //Children, push those that apply (with the nearest pushed last)
                if (cell.children.length > 0) {

                    testAngle = Math.atan2(cell.y - y1, cell.x - x1);

                    //Bottom right
                    if (x2 >= cell.x && y2 >= cell.y &&
                        geo.inclusiveBetween(lineAngle, Math.atan2(cell.y - y1, cell.max.x - x1),
                            Math.atan2(cell.max.y - y1, cell.x - x1)))

                        cells.push(cell.children[0]);

                    //Top right
                    if (x2 >= cell.x && lineAngle <= testAngle || y1 <= cell.y)
                        cells.push(cell.children[3]);

                    //Bottom left
                    if (y2 >= cell.y && lineAngle >= testAngle || x1 <= cell.x)
                        cells.push(cell.children[1]);

                    //Top left
                    if (x1 <= cell.x && y1 <= cell.y &&
                        geo.inclusiveBetween(lineAngle, Math.atan2(cell.min.y - y1, cell.x - x1),
                            Math.atan2(cell.y - y1, cell.min.x - x1)))

                        cells.push(cell.children[2]);

                //No children, give it
                } else if (cell.contents.length) yield cell.contents;

        //Going down towards the left
        else if (lineAngle >= Math.PI / 2 && lineAngle <= Math.PI)

            while (cell = cells.pop())

                //Children, push those that apply (with the nearest pushed last)
                if (cell.children.length > 0) {

                    testAngle = Math.atan2(cell.y - y1, cell.x - x1);

                    //Bottom left
                    if (x2 <= cell.x && y2 >= cell.y &&
                        geo.inclusiveBetween(lineAngle, Math.atan2(cell.max.y - y1, cell.x - x1),
                            Math.atan2(cell.y - y1, cell.min.x - x1)))
                        cells.push(cell.children[1]);

                    //Top left
                    if (x2 <= cell.x && lineAngle >= testAngle || y1 <= cell.y)
                        cells.push(cell.children[2]);

                    //Bottom right
                    if (y2 >= cell.y && lineAngle <= testAngle || x1 >= cell.x)
                        cells.push(cell.children[0]);

                    //Top right
                    if (x1 >= cell.x && y1 <= cell.y &&
                        geo.inclusiveBetween(lineAngle, Math.atan2(cell.y - y1, cell.max.x - x1),
                            Math.atan2(cell.min.y - y1, cell.x - x1)))
                        cells.push(cell.children[3]);

                //No children, give it
                } else if (cell.contents.length) yield cell.contents;

        //Going up towards the left
        else if (lineAngle >= -Math.PI && lineAngle <= Math.PI / -2)

            while (cell = cells.pop())

                //Children, push those that apply (with the nearest pushed last)
                if (cell.children.length > 0) {

                    testAngle = Math.atan2(cell.y - y1, cell.x - x1);

                    //Top left
                    if (x2 <= cell.x && y2 <= cell.y &&
                        geo.inclusiveBetween(lineAngle, Math.atan2(cell.y - y1, cell.min.x - x1),
                            Math.atan2(cell.min.y - y1, cell.x - x1)))
                        cells.push(cell.children[2]);

                    //Top right
                    if (y2 <= cell.y && lineAngle >= testAngle || x1 >= cell.x)
                        cells.push(cell.children[3]);

                    //Bottom left
                    if (x2 <= cell.x && lineAngle <= testAngle || y1 >= cell.y)
                        cells.push(cell.children[1]);

                    //Bottom right
                    if (x1 >= cell.x && y1 >= cell.y &&
                        geo.inclusiveBetween(lineAngle, Math.atan2(cell.max.y - y1, cell.x - x1),
                            Math.atan2(cell.y - y1, cell.max.x - x1)))
                        cells.push(cell.children[0]);

                //No children, give it
                } else if (cell.contents.length) yield cell.contents;

        //Going up towards the right
        else if (lineAngle >= Math.PI / -2 && lineAngle <= 0)

            while (cell = cells.pop())

                //Children, push those that apply (with the nearest pushed last)
                if (cell.children.length > 0) {

                    testAngle = Math.atan2(cell.y - y1, cell.x - x1);

                    //Top right
                    if (x2 >= cell.x && y2 <= cell.y &&
                        geo.inclusiveBetween(lineAngle, Math.atan2(cell.min.y - y1, cell.x - x1),
                            Math.atan2(cell.y - y1, cell.max.x - x1)))
                        cells.push(cell.children[3]);

                    //Top left
                    if (y2 <= cell.y && lineAngle <= testAngle || x1 <= cell.x)
                        cells.push(cell.children[2]);

                    //Bottom right
                    if (x2 >= cell.x && lineAngle >= testAngle || y1 >= cell.y)
                        cells.push(cell.children[0]);

                    //Bottom left
                    if (x1 <= cell.x && y1 >= cell.y &&
                        geo.inclusiveBetween(lineAngle, Math.atan2(cell.y - y1, cell.min.x - x1),
                            Math.atan2(cell.max.y - y1, cell.x - x1)))
                        cells.push(cell.children[1]);

                //No children, give it
                } else if (cell.contents.length) yield cell.contents;

    };

    window.DQuadTree = DQuadTree;

}(window));
