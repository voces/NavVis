
(function(window) {

    const drawing = window.drawing;

    function savePoints() {

        console.log("Saving points...");

        let pointString = drawing.svg.firstChild.firstChild.nextSibling.getAttribute("d").match(/[0-9]+/g),
            points = [];

        for (let i = 0; i < pointString.length; i += 2)
            points[i / 2] = {x: Number.parseFloat(pointString[i]), y: Number.parseFloat(pointString[i + 1])};

        localStorage.points = JSON.stringify(points);
        localStorage.testID = 0;

    }

    function pointToString() {

        return this.x + "," + this.y;

    }

    function finalizePoints(arr) {

        for (let i = 0; i < arr.length; i++)
            arr[i].toString = pointToString;

        return arr;

    }

    function loadPoints() {

        console.log("Loading points...");

        let path = new drawing.Path(finalizePoints(JSON.parse(localStorage.points)));

        for (let i = 0; i < drawing.onAdd.length; i++)
            drawing.onAdd[i](path);

    }

    function testPoints() {

        console.log("Testing points...");

        let points = JSON.parse(localStorage.points);

        points.splice(localStorage.testID, 1);

        let path = new drawing.Path(finalizePoints(points));

        for (let i = 0; i < drawing.onAdd.length; i++)
            drawing.onAdd[i](path);

    }

    function resetTest() {

        console.log("Resetting test ID...");

        localStorage.testID = 0;

    }

    function passedTest() {

        console.log("Passed test, keeping item and moving along...");

        localStorage.testID++;

    }

    function failedTest() {

        console.log("Failed test, removing item...");

        let points = JSON.parse(localStorage.points);

        points.splice(localStorage.testID, 1);

        localStorage.points = JSON.stringify(points);

    }

    window.addEventListener("keyup", e => {

        switch (e.code) {
            case "KeyS": savePoints(); break;
            case "KeyL": loadPoints(); break;
            case "KeyT": testPoints(); break;
            case "KeyR": resetTest(); break;
            case "KeyP": passedTest(); break;
            case "KeyF": failedTest(); break;
        }


    });

}(window));
