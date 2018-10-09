function DefenseNetworkObj(sprite, particleShape, rangeShape) {
    this.emitter = new Emitter(particleShape);
    this.towers = [];
    this.update = function(enemyPositions) {
        this.emitter.update();
        this.towers.forEach(tower => tower.fireUpon(enemyPositions));
    };
    this.draw = function() {
        this.towers.forEach(tower => tower.draw());
        this.emitter.draw();
    };
    this.upgradeAt = function(point) {
        try { this.towerAt(point).upgrade(); }
        catch (e) { if (!(e instanceof TypeError)) throw e; }
    };
    this.highlightRangeAt = function(point) {
        try { this.towerAt(point).highlightRange(); }
        catch (e) { if (!(e instanceof TypeError)) throw e; }
    };
    this.place = function(type, point) {
        if (this.towerAt(point)) return;
        this.towers.push(new TowerObj(
            sprite, point, type, rangeShape,
	        this.emitter.addParticle.bind(this.emitter)));
    };
    this.towerAt = function(point) {
        return this.towers.find(tower => tower.isAt(point));
    };
    return this;
}

let towerTypes = [
    [ // cannon
        {"damage": 8, "range": 42, "pAmount": 1, "pSize": 25, "reload": 75, "speed": 6},
        {"damage": 12, "range": 42, "pAmount": 1, "pSize": 25, "reload": 75, "speed": 6},
        {"damage": 16, "range": 42, "pAmount": 1, "pSize": 25, "reload": 75, "speed": 6}, ],
    [ // flame
        {"damage": 0.2, "range": 42, "pAmount": 20, "pSize": 10, "reload": 0, "speed": 6},
        {"damage": 0.35, "range": 42, "pAmount": 20, "pSize": 10, "reload": 0, "speed": 6},
        {"damage": 0.5, "range": 42, "pAmount": 20, "pSize": 10, "reload": 0, "speed": 6}, ],
    [// tesla
        {"damage": 0.3, "range": 42, "pAmount": 20, "pSize": 10, "reload": 0, "speed": 6},
        {"damage": 0.3, "range": 52, "pAmount": 20, "pSize": 10, "reload": 0, "speed": 6},
        {"damage": 0.3, "range": 62, "pAmount": 20, "pSize": 10, "reload": 0, "speed": 6}, ],
    [ // egg gun
        {"damage": 4, "range": 48, "pAmount": 3, "pSize": 25, "reload": 30, "speed": 2},
        {"damage": 4, "range": 48, "pAmount": 3, "pSize": 25, "reload": 25, "speed": 2},
        {"damage": 4, "range": 48, "pAmount": 3, "pSize": 25, "reload": 20, "speed": 2}, ],
    [ // machine gun
        {"damage": 0.5, "range": 62, "pAmount": 6, "pSize": 10, "reload": 6, "speed": 6},
        {"damage": 1.0, "range": 62, "pAmount": 6, "pSize": 10, "reload": 6, "speed": 6},
        {"damage": 1.5, "range": 62, "pAmount": 6, "pSize": 10, "reload": 6, "speed": 6}, ],
    [ // untitled
        {"damage": 8, "range": 62, "pAmount": 6, "pSize": 8, "reload": 15, "speed": 2},
        {"damage": 8, "range": 62, "pAmount": 6, "pSize": 8, "reload": 15, "speed": 4},
        {"damage": 8, "range": 62, "pAmount": 6, "pSize": 8, "reload": 15, "speed": 6}, ],
    [ // missile
        {"damage": 3, "range": 80, "pAmount": 6, "pSize": 25, "reload": 30, "speed": 12},
        {"damage": 3, "range": 120, "pAmount": 6, "pSize": 25, "reload": 30, "speed": 12},
        {"damage": 3, "range": 160, "pAmount": 6, "pSize": 25, "reload": 30, "speed": 12}, ],
    [ // shotgun
        {"damage": 4, "range": 48, "pAmount": 3, "pSize": 25, "reload": 30, "speed": 5},
        {"damage": 4, "range": 48, "pAmount": 3, "pSize": 30, "reload": 30, "speed": 5},
        {"damage": 4, "range": 48, "pAmount": 3, "pSize": 35, "reload": 30, "speed": 5}, ],
    [ // untitled2
        {"damage": 4, "range": 60, "pAmount": 6, "pSize": 10, "reload": 30, "speed": 8},
        {"damage": 4, "range": 80, "pAmount": 6, "pSize": 10, "reload": 30, "speed": 8},
        {"damage": 4, "range": 100, "pAmount": 6, "pSize": 10, "reload": 30, "speed": 8}, ],
];

function TowerObj(sprite, point, type, rangeShape, addParticle) {
    this.sprite = sprite;
    this.point = point;
    this.type = type * 3;
    this.variations = towerTypes[type];
    this.level = 0;
    this.attributes = this.variations[this.level];
    this.centerFeet = new PointObj(this.sprite.width / 2, this.sprite.height);
    this.currentReload = this.attributes.reload;
    this.col = 6;
    this.draw = function() {
        let drawPos = this.point.sub(this.centerFeet.x, this.centerFeet.y);
        this.sprite.draw(
            this.col, this.type + this.level, drawPos.x, drawPos.y);
    };
    this.highlightRange = function() {
        rangeShape.draw(
            this.point.x, this.point.y, this.attributes.range, undefined,
            "SteelBlue",  "rgba(30, 144, 255, 0.20)")
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

