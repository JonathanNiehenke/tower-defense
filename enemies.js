function Enemies(sprite, healthBarShape, circle, mapMovement) {
    this.sprite = sprite;
    this.healthBarShape = healthBarShape;
    this.mapMovement = mapMovement;
    this.waveInfo = this.enemies = [];
    this.newWaves = function(waveInfo) {
        this.waveInfo = waveInfo;
        this.currentWave = this.waveInfo.shift();
    };
    this.update = function() {
        for (let creep of this.enemies)
            creep.update();
    };
    this.updateWave = function() {
        this.enemies = this.enemies.filter(creep => creep.health > 0);
        if (this.currentWave === undefined)
            throw "end of level";
        else if (this.currentWave.amount)
            this.createCreep();
        else if (this.enemies.length == 0)
            this.currentWave = this.waveInfo.shift();
    };
    this.createCreep = function() {
        if (this.isSpaced()) {
            this.enemies.push(new Creep(this.sprite, this.healthBarShape,
            circle, this.mapMovement, this.currentWave));
            --this.currentWave.amount;
        }
    };
    this.isSpaced = function() {
        if (this.enemies.length == 0) return true;
        const lastIdx = this.enemies.length - 1;
        return this.enemies[lastIdx].traveled() > this.currentWave.spacing;
    };
    this.positions = function*() {
        for (enemy of this.enemies)
            yield enemy.point();
    };
    this.draw = function(condition=undefined, adjust=undefined) {
        for (creep of this.enemies) {
            if (condition !== undefined && !condition(creep.progress.point))
                continue;
            creep.drawHealth(this.currentWave.health, adjust);
            creep.draw(adjust);
        }
    };
    this.drawMini = function(origin, size) {
        for (creep of this.enemies)
            creep.drawMini(origin, size);
    };
    this.hit = function(withinRange, damageAmount) {
        let creep = this.enemies.find(creep => withinRange(creep.point(), 7));
        try { creep.damage(damageAmount); }
        catch (_) { return false; }
        return true;
    };
    this.return;
}

function Creep(sprite, healthBarShape, circle, mapMovement, waveAttributes) {
    this.sprite = sprite;
    this.healthBarShape = healthBarShape;
    this.mapMovement = mapMovement;
    this.progress = {
        "point": waveAttributes.start.add(0, 0),
        "heading": waveAttributes.heading,
        "speed": waveAttributes.speed,
        "traveled": 0,
    };
    this.health = waveAttributes.health;
    this.center = new Point(this.sprite.width / 2, this.sprite.height / 2);
    this.facing = { "N": 0, "S": 1, "E": 2, "W": 3 };
    this.update = function() {
        try { this.mapMovement(this.progress); }
        catch (e) {this.updateCatch(e)}
    }
    this.updateCatch = function(error) {
        if (error === "Off map")
            this.health = 0;
        else
            throw error;
    };
    this.drawHealth = function(initHealth, adjust=undefined) {
        const {x, y} = this.drawPos(adjust);
        this.healthBarShape.draw(x, y + this.sprite.height,
            this.sprite.width, 5, "Black", this.health/initHealth);
    };
    this.draw = function(adjust=undefined) {
        const {x, y} = this.drawPos(adjust);
        const animation = Math.floor(this.progress.traveled / 5);
        const facing = this.facing[this.progress.heading];
        this.sprite.draw(x, y, animation, facing);
    };
    this.drawPos = function(adjust=undefined) {
        return (adjust === undefined ? this.point() : adjust(this.point())
            ).sub(this.center.x, this.center.y).floor();
    };
    this.drawMini = function(origin, size) {
        const {x, y} = this.point().div(size).add(origin.x, origin.y);
        circle.draw(x, y, 12/size, undefined, "black", "black");
    };
    this.point = function() {
        return this.progress.point;
    };
    this.traveled = function() {
        return this.progress.traveled;
    };
    this.damage = function(amount) {
        this.health -= amount;
    };
}

