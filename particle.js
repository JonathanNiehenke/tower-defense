function Particle(sprite, point, speed, lifespan) {
    this.sprite = sprite;
    this.point = point;
    this.speed = speed;
    this.lifespan = lifespan;
    this.direction = new PointObj(0, 0);
    this.renew = function(point, direction, lifespan) {
        this.point = point;
        this.direction = direction;
        this.lifespan = lifespan;
    };
    this.update = function() { 
        this.point.iAdd(this.direction.multi(this.speed));
        this.lifespan -= this.speed;
    };
    this.draw = function() {
        if (this.isAlive()) {
            this.sprite.draw(1, 1,
                this.point.x - (this.sprite.width/2),
                this.point.y - (this.sprite.height/2)
            );
        }
    };
    this.isAlive = function() {
        return this.lifespan > 0;
    };
};
