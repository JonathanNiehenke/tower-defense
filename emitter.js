function Emitter(point, shape, {range, pAmount, speed, pSize}) {
    this.point = point;
    this.range = range;
    this.speed = speed;
    this.radius = pSize/2;
    this.living = [], this.dead = [];
    this.upgrade = function({range, speed, pSize}) {
        this.range = range;
        this.speed = speed;
        this.radius = pSize/2;
    };
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
    };
    this.draw = function() {
        for(let particle of this.living)
            particle.draw();
    };
    this.addparticle = function(direction) {
        let particle = (
            this.dead.length ? this.dead.shift() : new Particle(shape));
        let point = new PointObj(this.point.x, this.point.y);
        particle.apply(point, direction, this.speed, this.radius);
        this.living.push(particle);
    };
    this.getLiveParticles = function*() {
        for (let particle of this.living)
            yield particle;
    };
    return this;
};

