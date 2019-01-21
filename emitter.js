function Emitter(shape) {
    this.living = [], this.dead = [];
    this.update = function(hitEnemies) {
        for (let particle of this.living)
            particle.update();
        this.killIf(particle => particle.outOfRange());
        this.killIf(particle => hitEnemies(
            (point, size) => particle.withinRange(point, size), particle.damage()));
    };
    this.killIf = function(condition) {
        for (let i = 0; i < this.living.length; ++i) {
            if (condition(this.living[i])) {
                this.dead.push(this.living[i]);
                this.living.splice(i--, 1);
            }
        }
    };
    this.draw = function(condition, adjust=undefined) {
        for(let particle of this.living)
                particle.draw(condition, adjust);
    };
    this.addParticle = function(point, direction, attributes) {
        let particle = (
            this.dead.length ? this.dead.shift() : new Particle(shape));
        particle.apply(point, direction, attributes);
        this.living.push(particle);
    };
    this.clear = function() {
        this.dead.push(...this.living.splice(0, this.living.length));
    };
    return this;
};

function Particle(shape) {
    this.origin = new Point(0, 0);
    this.point = new Point(0, 0);
    this.direction = new Point(0, 0);
    this.apply = function(point, direction, attributes) {
        this.origin.change(point.x, point.y);
        this.point.change(point.x, point.y);
        this.direction.change(direction.x, direction.y);
        this.attributes = attributes;
    };
    this.update = function() {
        this.point.iAdd(this.direction.multi(this.attributes.speed));
    };
    this.draw = function(condition, adjust) {
        if (condition !== undefined && !condition(this.point)) return;
        const drawPos = adjust === undefined ? this.point : adjust(this.point);
        shape.draw(drawPos.x, drawPos.y, this.attributes.pSize,
            undefined, "red", "white");
    };
    this.outOfRange = function() {
        return this.origin.distFrom(this.point) > this.attributes.range;
    };
    this.withinRange = function(point, hitSize=0) {
        const size = this.attributes.pSize + hitSize;
        return this.point.distFrom(point) <= size;
    };
    this.damage = function() {
        return this.attributes.damage;
    };
};
