function Particle(shape) {
    this.origin = new PointObj(0, 0, "Isometric");
    this.point = new PointObj(0, 0, "Isometric");
    this.direction = new PointObj(0, 0);
    this.apply = function(point, direction, attributes) {
        this.origin.change(point.x, point.y);
        this.point.change(point.x, point.y);
        this.direction.change(direction.x, direction.y);
        this.attributes = attributes;
    };
    this.update = function() { 
        this.point.iAdd(this.direction.multi(this.attributes.speed));
    };
    this.draw = function() {
        shape.draw(this.point.x, this.point.y, this.attributes.pSize / 2,
            undefined, "red", "white");
    };
    this.outOfRange = function() {
        return this.origin.distFrom(this.point) > this.attributes.range;
    };
    this.withinRange = function(point) {
        return this.point.distFrom(point) <= this.attributes.pSize;
    };
    this.damage = function() {
        return this.attributes.damage;
    };
};
