function Emitter(shape) {
    this.living = [], this.dead = [];
    this.update = function() {
        let temp = [];
        while (this.living.length) {
            let particle = this.living.shift();
            particle.update();
            (particle.outOfRange() ? this.dead : temp).push(particle);
        }
        this.living = temp;
    };
    this.draw = function() {
        for(let particle of this.living)
            particle.draw();
    };
    this.addParticle = function(point, direction, attributes) {
        let particle = (
            this.dead.length ? this.dead.shift() : new Particle(shape));
        particle.apply(point, direction, attributes);
        this.living.push(particle);
    };
    this.getLiveParticles = function*() {
        for (let particle of this.living)
            yield particle;
    };
    return this;
};

