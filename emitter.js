function Emitter(shape) {
    this.living = [], this.dead = [];
    this.update = function(hitEnemies) {
        for (let particle of this.living)
            particle.update();
        this.killIf(particle => particle.outOfRange());
    };
    this.killIf = function(condition) {
        for (let i = 0; i < this.living.length; ++i) {
            if (condition(this.living[i])) {
                this.dead.push(this.living[i]);
                this.living.splice(i--, 1);
            }
        }
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

