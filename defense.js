function DefenseNetwork(sprite, particleShape, rangeShape, miniShape, miniRange) {
    this.emitter = new Emitter(particleShape);
    this.towers = [];
    this.update = function(enemyPositions, hitEnemies) {
        this.emitter.update(hitEnemies);
        this.towers.forEach(tower => tower.fireUpon(enemyPositions));
    };
    this.draw = function(condition=undefined, adjust=undefined) {
        this.towers.forEach(tower => tower.draw(condition, adjust));
        this.emitter.draw(condition, adjust);
    };
    this.drawMini = function(origin, size) {
        this.towers.forEach(tower => tower.drawMini(origin.x, origin.y, size));
    };
    this.upgradeAt = function(point) {
        try { this.towerAt(point).upgrade(); }
        catch (e) { if (!(e instanceof TypeError)) throw e; }
    };
    this.highlightRangeAt = function(point, adjust=undefined, scalingFactor) {
        try { this.towerAt(point).highlightRange(adjust, scalingFactor); }
        catch (e) { if (!(e instanceof TypeError)) throw e; }
    };
    this.highlightMiniRangeAt = function(point, origin, size) {
        try { this.towerAt(point).highlightMiniRange(origin.x, origin.y, size); }
        catch (e) { if (!(e instanceof TypeError)) throw e; }
    };
    this.place = function(type, point) {
        if (this.towerAt(point)) return;
        this.towers.push(new Tower(
            sprite, point, type, rangeShape, miniShape, miniRange,
	        this.emitter.addParticle.bind(this.emitter)));
    };
    this.towerAt = function(point) {
        return this.towers.find(tower => tower.isAt(point));
    };
    this.clear = function() {
        this.towers.splice(0, this.towers.length);
        this.emitter.clear();
    };
    return this;
}

let towerTypes = [
    [ // cannon
        {"damage": 8, "range": 84, "pAmount": 1, "pSize": 12, "reload": 75, "speed": 6},
        {"damage": 12, "range": 84, "pAmount": 1, "pSize": 12, "reload": 75, "speed": 6},
        {"damage": 16, "range": 84, "pAmount": 1, "pSize": 12, "reload": 75, "speed": 6}, ],
    [ // flame
        {"damage": 0.2, "range": 84, "pAmount": 20, "pSize": 5, "reload": 0, "speed": 6},
        {"damage": 0.35, "range": 84, "pAmount": 20, "pSize": 5, "reload": 0, "speed": 6},
        {"damage": 0.5, "range": 84, "pAmount": 20, "pSize": 5, "reload": 0, "speed": 6}, ],
    [// tesla
        {"damage": 0.3, "range": 84, "pAmount": 20, "pSize": 5, "reload": 0, "speed": 6},
        {"damage": 0.3, "range": 104, "pAmount": 20, "pSize": 5, "reload": 0, "speed": 6},
        {"damage": 0.3, "range": 124, "pAmount": 20, "pSize": 5, "reload": 0, "speed": 6}, ],
    [ // egg gun
        {"damage": 4, "range": 96, "pAmount": 3, "pSize": 12, "reload": 30, "speed": 2},
        {"damage": 4, "range": 96, "pAmount": 3, "pSize": 12, "reload": 25, "speed": 2},
        {"damage": 4, "range": 96, "pAmount": 3, "pSize": 12, "reload": 20, "speed": 2}, ],
    [ // machine gun
        {"damage": 0.5, "range": 124, "pAmount": 6, "pSize": 5, "reload": 6, "speed": 6},
        {"damage": 1.0, "range": 124, "pAmount": 6, "pSize": 5, "reload": 6, "speed": 6},
        {"damage": 1.5, "range": 124, "pAmount": 6, "pSize": 5, "reload": 6, "speed": 6}, ],
    [ // untitled
        {"damage": 8, "range": 124, "pAmount": 6, "pSize": 4, "reload": 15, "speed": 2},
        {"damage": 8, "range": 124, "pAmount": 6, "pSize": 4, "reload": 15, "speed": 4},
        {"damage": 8, "range": 124, "pAmount": 6, "pSize": 4, "reload": 15, "speed": 6}, ],
    [ // missile
        {"damage": 3, "range": 160, "pAmount": 6, "pSize": 12, "reload": 30, "speed": 12},
        {"damage": 3, "range": 240, "pAmount": 6, "pSize": 12, "reload": 30, "speed": 12},
        {"damage": 3, "range": 320, "pAmount": 6, "pSize": 12, "reload": 30, "speed": 12}, ],
    [ // shotgun
        {"damage": 4, "range": 96, "pAmount": 3, "pSize": 12, "reload": 30, "speed": 5},
        {"damage": 4, "range": 96, "pAmount": 3, "pSize": 15, "reload": 30, "speed": 5},
        {"damage": 4, "range": 96, "pAmount": 3, "pSize": 20, "reload": 30, "speed": 5}, ],
    [ // untitled2
        {"damage": 4, "range": 120, "pAmount": 6, "pSize": 10, "reload": 30, "speed": 8},
        {"damage": 4, "range": 160, "pAmount": 6, "pSize": 10, "reload": 30, "speed": 8},
        {"damage": 4, "range": 200, "pAmount": 6, "pSize": 10, "reload": 30, "speed": 8}, ],
];

function Tower(sprite, point, type, rangeShape, miniShape, miniRange, addParticle) {
    this.sprite = sprite;
    this.point = point;
    this.type = type * 3;
    this.variations = towerTypes[type];
    this.level = 0;
    this.attributes = this.variations[this.level];
    this.centerFeet = new Point(this.sprite.width / 2, this.sprite.height);
    this.currentReload = this.attributes.reload;
    this.col = 6;
    this.draw = function(condition=undefined, adjust=undefined) {
        if (condition !== undefined && !condition(this.point)) return;
        let drawPos = this.drawPos(adjust).sub(this.centerFeet.x, this.centerFeet.y);
        this.sprite.draw(
            drawPos.x, drawPos.y, this.col, this.type + this.level);
    };
    this.drawMini = function(x, y, size) {
        const drawPos = this.point.div(size).add(x - 12/size, y - 12/size);
        miniShape.draw(drawPos.x, drawPos.y, 24/size, 24/size, "black", "black");
    };
    this.highlightRange = function(adjust, scalingFactor) {
        let drawPos = this.drawPos(adjust);
        rangeShape.draw(
            drawPos.x, drawPos.y, this.attributes.range * scalingFactor,
            undefined, "SteelBlue",  "rgba(30, 144, 255, 0.20)")
    };
    this.highlightMiniRange = function(x, y, size) {
        const drawPos = this.point.div(size).add(x, y);
        miniRange.draw(
            drawPos.x, drawPos.y, this.attributes.range/size,
            undefined, "SteelBlue",  "rgba(30, 144, 255, 0.20)");
    };
    this.drawPos = function(adjust=undefined) {
        return adjust === undefined ? this.point : adjust(this.point);
    };
    this.upgrade = function() {
        this.level += this.level < 2 ? 1 : 0;
        this.attributes = this.variations[this.level];
    };
    this.fireUpon = function(enemyPositions) {
        for (const enemyPos of enemyPositions()) {
            if (this.point.distFrom(enemyPos) <= this.attributes.range) {
                this.fireAt(enemyPos);
                break;
            }
        }
        --this.currentReload;
    }
    this.fireAt = function(point) {
        this.setBarrelAngle(this.toDegree(
            Math.atan2(this.point.y - point.y, this.point.x - point.x)));
        if (this.currentReload <= 0)
            this.sendProjectile(point);
    };
    this.sendProjectile = function(point) {
        let direction = point.sub(this.point.x, this.point.y).normalize();
        addParticle(this.point, direction, this.attributes);
        this.currentReload = this.attributes.reload;
    };
    this.toDegree = function(radian) {
        let degree = radian * 180 / Math.PI;
        return degree < 0 ? degree + 360 : degree % 360;
    };
    this.setBarrelAngle = function(degree) {
        const span = 360 / 8, toCenter = span / 2;
        this.col = Math.floor((degree + toCenter) % 360 / span);
    };
    this.isAt = function(point) {
        return this.point.equals(point.x, point.y);
    };
}

