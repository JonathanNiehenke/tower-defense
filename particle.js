function Particle(sprite, point, speed, lifespan) {
    this.sprite = sprite;
    this.point = point;
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
        this.sprite.draw(1, 1,
            this.point.x - (this.sprite.width/2),
            this.point.y - (this.sprite.height/2)
        );
    };
    this.distFrom = function(point) {
        return point.distFrom(this.point);
    };
};
