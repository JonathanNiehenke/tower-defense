function Particle(shape, point, radius, speed) {
    this.point = point;
    this.radius = radius;
    this.speed = speed;
    this.direction = new PointObj(0, 0);
    this.renew = function(point, direction) {
        this.point = point;
        this.direction = direction;
    };
    this.update = function() { 
        this.point.iAdd(this.direction.multi(this.speed));
    };
    this.draw = function() {
        shape.draw(this.point.x, this.point.y, radius,
            undefined, "red", "white");
    };
    this.distFrom = function(point) {
        return point.distFrom(this.point);
    };
};
