function Point(x, y) {
    this.x = x;
    this.y = y;
    this.equals = function(x, y) {
        return this.x == x && this.y == y;
    };
    this.add = function(z, y=undefined) {
        y = (y === undefined ? z : y);
        return new Point(this.x + z, this.y + y);
    };
    this.iAdd = function(point) {
        this.x += point.x;
        this.y += point.y;
    },
    this.sub = function(z, y=undefined) {
        y = (y === undefined ? z : y);
        return new Point(this.x - z, this.y - y);
    };
    this.aSub = function(z, y=undefined) {
        y = (y === undefined ? z : y);
        return new Point(Math.abs(this.x - z), Math.abs(this.y - y));
    };
    this.multi = function(z, y=undefined) {
        y = (y === undefined ? z : y);
        return new Point(this.x * z, this.y * y);
    };
    this.div = function(z, y=undefined) {
        y = (y === undefined ? z : y);
        return new Point(this.x / z, this.y / y);
    };
    this.fdiv = function(z, y=undefined) {
        y = (y === undefined ? z : y);
        return new Point(
            Math.floor( this.x / z), Math.floor(this.y / y));
    };
    this.iDiv = function(int) {
        this.x=this.x / int;
        this.y=this.y / int;
    };
    this.floor = function() {
        return new Point(Math.floor(this.x), Math.floor(this.y));
    };
    this.distFrom = function(point) {
        let difference = this.aSub(point.x, point.y);
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
    this.toString = function() {
        return `${this.x}, ${this.y}`
    };
    return this;
}
