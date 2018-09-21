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
    this.floor = function() {
        return new PointObj(Math.floor(this.x), Math.floor(this.y), this.type);
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
