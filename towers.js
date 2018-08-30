function TowerObj(
    sprite, point, type, variations, rangeShape, emitterOn, partSprite) {
    this.sprite = sprite;
    this.point = point;
    this.type = type;
    this.variations = variations.slice(type, type + 3);
    this.rangeShape = rangeShape;
    this.isEmitterOn = emitterOn;
    this.emitter = new Emitter(this.point, new PointObj(0, 0), 80,
        this.variations[0].pAmount, partSprite);
    this.centerFeet = new PointObj(this.sprite.width / 2, this.sprite.height);
    this.level = 0;
    this.damage = this.variations[this.level].damage;
    this.pSize = this.variations[this.level].pSize;
    this.range = this.variations[this.level].range;
    this.reload = this.currentReload = this.variations[this.level].reload;
    this.speed = this.variations[this.level].speed;
    this.col = 6;
    this.draw = function(point) {
        let drawPos = ((point === undefined)
            ? this.point.sub(this.centerFeet.x, this.centerFeet.y)
            : this.point.add(point.x, point.y));
        this.sprite.draw(
            this.col, this.type + this.level, drawPos.x, drawPos.y);
        if (this.isEmitterOn)
            this.emitter.draw();
    };
    this.highlightRange = function() {
        this.rangeShape.draw(this.point.x, this.point.y, this.range, undefined,
            "SteelBlue",  "rgba(30, 144, 255, 0.20)")
    };
    this.upgrade = function() {
        this.level += this.level < 2 ? 1 : 0;
        this.damage = this.variations[this.level].damage;
        this.pSize = this.variations[this.level].pSize;
        this.range = this.variations[this.level].range;
        this.reload = this.variations[this.level].reload;
        this.speed = this.variations[this.level].speed;
    };
    this.setPoint = function(point) {
        this.point = point;
        this.emitter.location = point;
    };
    this.setTarget = function(point) {
        this.target = point;
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

