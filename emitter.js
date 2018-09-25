function Emitter(point, sprite, {range, pAmount, speed}) {
    this.point = point;
    this.sprite = sprite;
    this.range = range;
    this.speed = speed;
    this.living = [], this.dead = [];
    this.update = function(direction) {
        let temp = [];
        while (this.living.length) {
            let particle = this.living.shift();
            particle.update();
            (this.outOfRange(particle) ? this.dead : temp).push(particle);
        }
        this.living = temp;
    };
    this.outOfRange = function(particle) {
        return particle.distFrom(this.point) > this.range;
    }
    this.draw = function() {
        for(let particle of this.living)
            particle.draw();
    };
    this.addparticle = function(direction) {
        let particle = this.dead.shift()
        let point = new PointObj(this.point.x, this.point.y);
        particle.renew(point, direction);
        this.living.push(particle);
    };
    this.getLiveParticles = function*() {
        for (let particle of this.living)
            yield particle;
    };
    this.poolMemory = function() {
        for(var i=0; i < pAmount; i++) {
            let point = new PointObj(this.point.x, this.point.y, "Isometric");
            this.dead[i] = new Particle(sprite, point, this.speed);
        }
    };
    this.poolMemory(); 
    return this;
};

