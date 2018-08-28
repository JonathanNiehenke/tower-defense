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
    this.equals = function(x, y) {
        return this.x == x && this.y == y;
    };
    this.add = function(z, y=undefined) {
        y = (y === undefined ? z : y);
        return new PointObj(this.x + z, this.y + y, this.type);
    };
    this.iAdd = function(point) {
        this.x += point.x;
        this.y += point.y;
    },
    this.sub = function(z, y=undefined) {
        y = (y === undefined ? z : y);
        return new PointObj(this.x - z, this.y - y, this.type);
    };
    this.aSub = function(z, y=undefined) {
        y = (y === undefined ? z : y);
        return new PointObj(Math.abs(this.x - z), Math.abs(this.y - y), this.type);
    };
    this.multi = function(z, y=undefined) {
        y = (y === undefined ? z : y);
        return new PointObj(this.x * z, this.y * y, this.type);
    };
    this.div = function(z, y=undefined) {
        y = (y === undefined ? z : y);
        return new PointObj(this.x / z, this.y / y, this.type);
    };
    this.fdiv = function(z, y=undefined) {
        y = (y === undefined ? z : y);
        return new PointObj(
            Math.floor( this.x / z), Math.floor(this.y / y), this.type);
    };
    this.iDiv = function(int) {
        this.x=this.x / int;
        this.y=this.y / int;
    };
    this.distFrom = function(point) {
        let difference = this.aSub(point.x, point.y);
         if (this.type === "Isometric")
             difference.x = Math.floor(difference.x / 2);
        return difference.magnitude();
    };
    this.magnitude = function() {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    };
    this.normalize = function() {
        return this.div(this.magnitude());
    };
    this.angleBetween = function(point) {	  
        return Math.atan2(point.y - this.y, point.x - this.x);
    }; 
    this.change = function(x,y) {
        this.x = x;
        this.y = y;
    };
    return this;
}

function SpriteObj(context, imgSheet, imgRows, imgCols) {
    this.context = context;
    this.img = loadImage(imgSheet);
    this.width = this.img.width / imgCols;
    this.height = this.img.height / imgRows;
    this.draw = function(col, row, x, y) {
        col = (col * this.width) % this.img.width;
        row = row * this.height;
        this.context.drawImage(this.img,
            col, row, this.width, this.height,  // Source
            x, y, this.width, this.height);  // Destination
    };
    return this;
}

function MenuDisplayObj(sprite, origin, spacing) {
    this.sprite = sprite;
    this.origin = origin;
    this.spacing = spacing === undefined ? new PointObj(0, 0) : spacing;
    this.draw = function(sheetX, sheetY, Point) {
        Point = this.origin.add(
            Point.x * (this.sprite.width + this.spacing.x),
            Point.y * (this.sprite.height + this.spacing.y));
        this.sprite.draw(sheetX, sheetY, Point.x, Point.y);
    };
    this.cellClicked = function(point) {
        let width = this.sprite.width + this.spacing.x;
        let height = this.sprite.height + this.spacing.y;
        let cell = new PointObj(Math.floor((point.x - origin.x) / width),
                                Math.floor((point.y - origin.y) / height));
        let innerPos = new PointObj(-(point.x - origin.x) % width,
                                    -(point.y - origin.y) % height);
        return {"cell": cell, "innerPos": innerPos};
    };
    return this;
}

function Sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function() {
        this.sound.play();
    }
    this.stop = function() {
        this.sound.pause();
    } 
}
