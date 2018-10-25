function Point(x, y) {
    this.x = x;
    this.y = y;
    this.change = function(x, y) {
        this.x = x;
        this.y = y;
    };
    this.iAdd = function(point) {
        this.x += point.x;
        this.y += point.y;
    },
    this.iSub = function(point) {
        this.x -= point.x;
        this.y -= point.y;
    },
    this.iMulti = function(point) {
        this.x = this.x * point.x;
        this.y = this.y * point.y;
    };
    this.iDiv = function(point) {
        this.x = this.x / point.x;
        this.y = this.y / point.y;
    };
    this.equals = function(x, y) {
        return this.x == x && this.y == y;
    };
    this.add = function(x, y) {
        return new Point(this.x + x, this.y + y);
    };
    this.sub = function(x, y) {
        return new Point(this.x - x, this.y - y);
    };
    this.multi = function(z) {
        return new Point(this.x * z, this.y * z);
    };
    this.div = function(z) {
        return new Point(this.x / z, this.y / z);
    };
    this.floor = function() {
        return new Point(Math.floor(this.x), Math.floor(this.y));
    };
    this.abs = function() {
        return new Point(Math.abs(this.x), Math.abs(this.y));
    };
    this.distFrom = function(point) {
        return this.sub(point.x, point.y).magnitude();
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
    this.toString = function() {
        return `${this.x}, ${this.y}`
    };
    return this;
}
