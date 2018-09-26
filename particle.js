function Particle(shape, point) {
    this.point = point;
    this.radius = this.speed = 0;
    this.direction = new PointObj(0, 0);
    this.renew = function(point, direction, speed, radius) {
        this.point = point;
        this.direction = direction;
        this.speed = speed;
        this.radius = radius;
    };
    this.update = function() { 
        this.point.iAdd(this.direction.multi(this.speed));
    };
    this.draw = function() {
        shape.draw(this.point.x, this.point.y, this.radius,
            undefined, "red", "white");
    };
    this.distFrom = function(point) {
        return point.distFrom(this.point);
    };
};
