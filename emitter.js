function Emitter(point, sprite, {range, pAmount, speed}) {
    this.point = point;
    this.sprite = sprite;
    this.lifespan = range;
    this.speed = speed;
    this.particles = [];
    this.update = function(direction) {
        for(let particle of this.particles)
            particle.update();
    };
    this.draw = function() {
        for(let particle of this.particles)
            particle.draw();
    };
    this.addparticle = function(direction) {
        for (let particle of this.particles) {
            if (!particle.isAlive()) {
                let point = new PointObj(this.point.x, this.point.y);
                particle.renew(point, direction, this.lifespan);
                break;
            }
        }
    };
    this.getLiveParticles = function*() {
        for (let particle of this.particles) {
            if (particle.isAlive())
                yield particle;
        }
    };
    this.poolMemory = function() {
        for(var i=0; i < pAmount; i++) {
            let point = new PointObj(this.point.x, this.point.y);
            this.particles[i] = new Particle(sprite, point, this.speed);
        }
    };
    this.poolMemory(); 
    return this;
};

