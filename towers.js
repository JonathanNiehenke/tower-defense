function DefenseNetworkObj(sprite, ballSprite, rangeShape) {
    this.sprite = sprite;
    this.ballSprite = ballSprite;
    this.towers = {};
    this.rangeShape = rangeShape;
    this.towerVariations = [
        // cannon
        {"damage": 8, "range": 42, "pAmount": 1, "pSize": 25, "reload": 75, "speed": 6},
        {"damage": 12, "range": 42, "pAmount": 1, "pSize": 25, "reload": 75, "speed": 6},
        {"damage": 16, "range": 42, "pAmount": 1, "pSize": 25, "reload": 75, "speed": 6},
        // flame
        {"damage": 0.2, "range": 42, "pAmount": 20, "pSize": 10, "reload": 0, "speed": 6},
        {"damage": 0.35, "range": 42, "pAmount": 20, "pSize": 10, "reload": 0, "speed": 6},
        {"damage": 0.5, "range": 42, "pAmount": 20, "pSize": 10, "reload": 0, "speed": 6},
        // tesla
        {"damage": 0.3, "range": 42, "pAmount": 20, "pSize": 10, "reload": 0, "speed": 6},
        {"damage": 0.3, "range": 52, "pAmount": 20, "pSize": 10, "reload": 0, "speed": 6},
        {"damage": 0.3, "range": 62, "pAmount": 20, "pSize": 10, "reload": 0, "speed": 6},
        // egg gun
        {"damage": 4, "range": 48, "pAmount": 3, "pSize": 25, "reload": 30, "speed": 2},
        {"damage": 4, "range": 48, "pAmount": 3, "pSize": 25, "reload": 25, "speed": 2},
        {"damage": 4, "range": 48, "pAmount": 3, "pSize": 25, "reload": 20, "speed": 2},
        // machine gun
        {"damage": 0.5, "range": 62, "pAmount": 6, "pSize": 10, "reload": 6, "speed": 6},
        {"damage": 1.0, "range": 62, "pAmount": 6, "pSize": 10, "reload": 6, "speed": 6},
        {"damage": 1.5, "range": 62, "pAmount": 6, "pSize": 10, "reload": 6, "speed": 6},
        // untitled
        {"damage": 8, "range": 62, "pAmount": 6, "pSize": 8, "reload": 15, "speed": 2},
        {"damage": 8, "range": 62, "pAmount": 6, "pSize": 8, "reload": 15, "speed": 4},
        {"damage": 8, "range": 62, "pAmount": 6, "pSize": 8, "reload": 15, "speed": 6},
        // missile
        {"damage": 3, "range": 80, "pAmount": 6, "pSize": 25, "reload": 30, "speed": 12},
        {"damage": 3, "range": 120, "pAmount": 6, "pSize": 25, "reload": 30, "speed": 12},
        {"damage": 3, "range": 160, "pAmount": 6, "pSize": 25, "reload": 30, "speed": 12},
        // shotgun
        {"damage": 4, "range": 48, "pAmount": 3, "pSize": 25, "reload": 30, "speed": 5},
        {"damage": 4, "range": 48, "pAmount": 3, "pSize": 30, "reload": 30, "speed": 5},
        {"damage": 4, "range": 48, "pAmount": 3, "pSize": 35, "reload": 30, "speed": 5},
        // untitled2
        {"damage": 4, "range": 60, "pAmount": 6, "pSize": 10, "reload": 30, "speed": 8},
        {"damage": 4, "range": 80, "pAmount": 6, "pSize": 10, "reload": 30, "speed": 8},
        {"damage": 4, "range": 100, "pAmount": 6, "pSize": 10, "reload": 30, "speed": 8},
    ];
    this.fireUpon = function(enemyPositions) {
        for (let tower of Object.values(this.towers))
            tower.fireUpon(enemyPositions);
    };
    this.draw = function() {
        Object.values(this.towers).forEach(tower => tower.draw());
    };
    this.upgradeAt = function(point) {
        try { this.towers[point.toString()].upgrade(); }
        catch (e) { if (!(e instanceof TypeError)) throw e; }
    };
    this.highlightRangeAt = function(point) {
        try { this.towers[point.toString()].highlightRange(); }
        catch (e) { if (!(e instanceof TypeError)) throw e; }
    };
    this.place = function(towerType, point) {
        if (this.towers[point.toString()] !== undefined) return;
        const type = towerType * 3;
        let towerVariation = this.towerVariations.slice(type, type + 3);
        this.towers[point.toString()] = new TowerObj(sprite, point, type,
            towerVariation, this.rangeShape, ballSprite);
    };
    return this;
}

function TowerObj(sprite, point, type, variations, rangeShape, partSprite) {
    this.sprite = sprite;
    this.point = point;
    this.type = type;
    this.variations = variations;
    this.level = 0;
    this.attributes = this.variations[this.level];
    this.emitter = new Emitter(point, new PointObj(0, 0), 80,
        this.attributes.pAmount, partSprite);
    this.centerFeet = new PointObj(this.sprite.width / 2, this.sprite.height);
    this.currentReload = this.attributes.reload;
    this.col = 6;
    this.draw = function() {
        let drawPos = this.point.sub(this.centerFeet.x, this.centerFeet.y);
        this.sprite.draw(
            this.col, this.type + this.level, drawPos.x, drawPos.y);
        this.emitter.draw();
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
    }
    this.fireAt = function(point) {
        this.setBarrelAngle(this.toDegree(
            Math.atan2(this.point.y - point.y, this.point.x - point.x)));
    };
    this.toDegree = function(radian) {
        let degree = radian * 180 / Math.PI;
        return degree < 0 ? degree + 360 : degree % 360;
    };
    this.setBarrelAngle = function(degree) {
        const span = 360 / 8, toCenter = span / 2;
        this.col = Math.floor((degree + toCenter) % 360 / span);
    };
}

