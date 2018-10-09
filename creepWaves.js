function EnemeiesObj(healthBarShape) {
    this.healthBarShape = healthBarShape;
    this.waveInfo = this.enemies = [];
    this.newWaves = function(waveInfo) {
        this.waveInfo = waveInfo;
        this.currentWave = this.waveInfo.shift();
    };
    this.update = function(headingFunc, directions) {
        for (let creep of this.enemies)
            creep.update(headingFunc, directions);
        try { this.updateWave(); }
        catch (_) { throw "End of waves"; }
    };
    this.updateWave = function() {
        this.enemies = this.enemies.filter(creep => creep.health > 0);
        if (this.currentWave.amount)
            this.createCreep();
        else if (this.enemies.length == 0)
            this.currentWave = this.waveInfo.shift();
    };
    this.createCreep = function() {
        if (this.isSpaced()) {
            this.enemies.push(new CreepObj(
                this.healthBarShape, this.currentWave));
            --this.currentWave.amount;
        }
    };
    this.isSpaced = function() {
        if (this.enemies.length == 0) return true;
        const lastIdx = this.enemies.length - 1;
        return this.enemies[lastIdx].traveled > this.currentWave.spacing;
    };
    this.positions = function*() {
        for (enemy of this.enemies)
            yield enemy.point;
    };
    this.draw = function() {
        for (creep of this.enemies)
            creep.drawHealth(this.currentWave.health);
        for (creep of this.enemies)
            creep.draw();
    };
    this.return;
}

function CreepObj(healthBarShape, {sprite, start, heading, speed, health}) {
    this.healthBarShape = healthBarShape;
    this.sprite = sprite;
    this.point = start;
    this.heading = heading;
    this.speed = speed;
    this.health = health;
    this.centerFeet = new PointObj(-this.sprite.width / 2, -this.sprite.height);
    this.col = this.traveled = 0;
    this.changeFacing = { "N": 0, "S": 1, "E": 2, "W": 3 };
    this.facing = this.changeFacing[this.heading];
    this.update = function(headingFunc, directions) {
        if (this.traveled % 20 < this.speed)
            try { this.setHeading(headingFunc); }
            catch (e) {this.updateCatch(e)}
        this.move(directions);
    }
    this.setHeading = function(headingFunc) {
        this.heading = headingFunc(this.point, this.heading);
        this.facing = this.changeFacing[this.heading];
    };
    this.updateCatch = function(error) {
        if (error === "Off map")
            this.health = 0;
        else
            throw error;
    };
    this.move = function(directions) {
        this.increment += this.speed;
        this.traveled += this.speed;
        this.col = Math.floor(this.traveled / 5);
        const trajectory = directions[this.heading].multi(this.speed);
        this.point = this.point.add(trajectory.x, trajectory.y);
    };
    this.drawHealth = function(initHealth) {
        const drawPos = this.point.floor(), spacing = 5, width = 5;
        this.healthBarShape.draw(
            drawPos.x - this.sprite.width / 2, drawPos.y + spacing,
            this.sprite.width, width, "Black", this.health/initHealth);
    };
    this.draw = function() {
        const drawPos = this.point.add(
            this.centerFeet.x, this.centerFeet.y).floor();
        this.sprite.draw(this.col, this.facing, drawPos.x, drawPos.y);
    };
}

