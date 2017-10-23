function loadImage(Name) {
    let img = new Image();
    img.src = Name;
    return img;
}

// Object that holds a point and converts between Cartesian and Isometric
function PointObj(x, y, type="Cartesian") {
    this.x = x;
    this.y = y;
    this.type = type;
    this.toCartesian = function() {
        return new PointObj((2*this.y + this.x) / 2, (2*this.y - this.x) / 2);
    };
    this.toIsometric = function() {
        return new PointObj(this.x - this.y, (this.x + this.y) / 2, "Isometric");
    };
    this.convert = function() {
        return this.type == "Cartesian" ? this.toIsometric() : this.toCartesian();
    };
    this.add = function(z, y=undefined) {
        y = (y !== undefined ? y : z);
        return new PointObj(this.x + z, this.y + y, this.type);
    };
    this.multi = function(z, y=undefined) {
        y = (y !== undefined ? y : z);
        return new PointObj(this.x * z, this.y * y, this.type);
    };
    this.div = function(z, y=undefined) {
        y = (y !== undefined ? y : z);
        return new PointObj(this.x / z, this.y / y, this.type);
    };
    this.fdiv = function(z, y=undefined) {
        y = (y !== undefined ? y : z);
        return new PointObj(
            Math.floor( this.x / z), Math.floor(this.y / y), this.type);
    };
    this.mod = function(z, y=undefined) {
        y = (y !== undefined ? y : z);
        return new PointObj(this.x % z, this.y % (y), this.type);
    };
    return this;
}

function MapObj(context, mapArray) {
    this.context = context;
    this.mapArray = mapArray;
    let basePath = "roadTiles_v2/png/";
    this.tiles = [
        loadImage(basePath + "grass.png"),
        loadImage(basePath + "roadNorth.png"),
        loadImage(basePath + "roadEast.png"),
        loadImage(basePath + "roadCornerES.png"),
        loadImage(basePath + "roadCornerNE.png"),
        loadImage(basePath + "roadCornerWS.png"),
        loadImage(basePath + "roadCornerNW.png"),
    ];
    this.isometricSize = this.tiles[0].width / 2;
    this.draw = function() {
        let rowAmount = mapArray.length, colAmount = mapArray[0].length;
        let iPoint;
        for (x = 0; x < rowAmount; ++x) {
            for (y = 0; y < colAmount; ++y) {
                iPoint = (new PointObj(y, x)).convert().multi(this.isometricSize);
                this.context.drawImage(this.tiles[this.mapArray[x][y]],
                    iPoint.x - this.isometricSize, iPoint.y);
            }
        }
    }
    return this;
}

function SpriteObj(context, imgSheet, rows, cols, point) {
    this.context = context;
    this.img = loadImage(imgSheet);
    this.width = this.img.width / cols;
    this.height = this.img.height / rows;
    this.point = point;
    this.centerFeet = new PointObj(-this.width / 2, -this.height);
    this.draw = function() {
        // image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight
        let drawPos = this.point.add(this.centerFeet.x, this.centerFeet.y);
        this.context.drawImage(this.img,
            0, 0, this.width, this.height,  // Source
            drawPos.x, drawPos.y, this.width, this.height);  // Destination
    };
    this.move = function(heading) {
        this.point = this.point.add(heading.x, heading.y);
    };
    return this;
}

function GameObj(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.directions = {
        "N": (new PointObj(0, -1)).convert(),
        "S": (new PointObj(0, 1)).convert(),
        "E": (new PointObj(1, 0)).convert(),
        "W": (new PointObj(-1, 0)).convert(),
        "NE": (new PointObj(1, -1)).convert(),
        "NW": (new PointObj(-1, -1)).convert(),
        "SE": (new PointObj(1, 1)).convert(),
        "SW": (new PointObj(-1, 1)).convert(),
    }
    this.mapArray = [
        [0, 5, 1, 1, 1, 6, 0],
        [0, 2, 0, 0, 0, 3, 6],
        [0, 2, 0, 0, 0, 0, 2],
        [1, 4, 0, 5, 6, 0, 2],
        [0, 0, 0, 2, 3, 1, 4],
        [0, 0, 0, 2, 0, 0, 0],
        [1, 1, 1, 4, 0, 0, 0]
    ];
    this.map = new MapObj(this.context, this.mapArray);
    this.isometricSize = this.map.isometricSize;
    this.movement = {"amount": 0, "heading": "E"};
    this.sprite = undefined;
    this.init = function() {
        let Point = (new PointObj(0, 6)).multi(this.isometricSize);
        let iPoint = Point.convert().add(0, this.map.tiles[0].height / 2);
        this.sprite = new SpriteObj(
            this.context, "sprites/Slime compact.png", 4, 4, iPoint);
    };
    this.getGridPos = function(Point) {
        return Point.fdiv(this.isometricSize);
    };
    this.getTilePos = function(Point) {
        return Point.mod(this.isometricSize);
    };
    this.tileMovement = function(sprite) {
        let gridPos = this.getGridPos(sprite.point.convert());
        let gridVal = this.mapArray[gridPos.y][gridPos.x];
        let tilePos = this.getTilePos(sprite.point);
        let heading = this.movement.heading;
        switch (gridVal) {
            case 1: this.movement = {"amount": 50,
                    "heading": heading == "E" ? "E" : "W"};
                break;
            case 2: this.movement = {"amount": 50,
                    "heading": heading == "N" ? "N" : "S"};
                break;
            case 3: this.movement = {"amount": 50,
                    "heading": heading == "S" ? "E" : "N"};
                break;
            case 4: this.movement = {"amount": 50,
                    "heading": heading == "S" ? "W" : "N", };
                break;
            case 5: this.movement = {"amount": 50,
                    "heading": heading == "N" ? "E" : "S", };
                break;
            case 6: this.movement = {"amount": 50,
                    "heading": heading == "N" ? "W" : "S", };
                break;
        }
        console.log(this.movement);
    };
    this.update = function() {
        if (!this.movement.amount)
            this.tileMovement(this.sprite);
        this.sprite.move(this.directions[this.movement.heading]);
        --this.movement.amount
    };
    this.draw = function() {
        this.context.save();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.translate(this.canvas.width / 2, 0);
        this.map.draw();
        this.sprite.draw();
        this.context.restore();
    };
    this.loop = function() {
        this.update();
        this.draw();
    };
    return this;
}

function init() {
    let game = new GameObj(document.querySelector("CANVAS"));
    game.init();
    setInterval(game.loop.bind(game), 30);
}
