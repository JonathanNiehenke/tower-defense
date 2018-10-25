function Map(tiles, shape) {
    this.tiles = tiles;
    this.shape = shape;
    this.size = this.tiles.getWidth();
    this.steps = 50;
    this.directions = {
        "N": (new Point(0, -this.size / this.steps)).convert(),
        "S": (new Point(0, this.size / this.steps)).convert(),
        "E": (new Point(this.size / this.steps, 0)).convert(),
        "W": (new Point(-this.size / this.steps, 0)).convert(),
    };
    this.structure = new MapStructure();
    this.applyLevel = function(structure) {
        this.structure.new(structure);
    };
    this.draw = function() {
        for (const [point, val] of this.structure.iter())
            this.tiles.draw(point.x * this.size, point.y * this.size, val);
    };
    this.highlightTileAt = function(gridPoint) {
        const iPoint = this.topOfTileAt(gridPoint);
        this.shape.draw(iPoint.x, iPoint.y, this.size, this.size,
            "silver",  "rgba(255, 255, 255, 0.20)");
    };
    this.movement = function(progress) {
        if (progress.traveled % this.steps < progress.speed)
            progress.heading = this.heading(progress.point, progress.heading);
        const trajectory = this.directions[progress.heading];
        progress.point.iAdd(trajectory.multi(progress.speed));
        progress.traveled += progress.speed;
    };
    this.heading = function(point, heading) {
        return this.tiles.movement(this.tileValueAt(point), heading);
    };
    this.isMap = function(isoPoint) {
        return this.tileValueAt(isoPoint) !== undefined;
    };
    this.pointIs = function(isoPoint, val) {
        return this.tileValueAt(isoPoint) === val;
    };
    this.tileValueAt = function(isoPoint) {
        return this.structure.value(this.gridPosAt(isoPoint));
    };
    this.startPos = function([x, y]) {
        return this.centerOfTileAt(this.toIso(new Point(x, y)));
    };
    this.centerOfTileAt = function(isoPoint) {
        return this.topOfTileAt(isoPoint).add(0, this.size / 2);
    };
    this.topOfTileAt = function(isoPoint) {
        return this.toIso(this.gridPosAt(isoPoint));
    };
    this.toIso = function(gridPoint) {
        return gridPoint.multi(this.size).convert()
    };
    this.gridPosAt = function(Point) {
        Point = Point.type == "Cartesian" ? Point : Point.convert();
        return Point.fdiv(this.size);
    };
    return this;
}

function MapStructure() {
    this.structure = [];
    this.new = function(structure) {
        this.structure = structure;
    };
    this.iter = function*() {
        for (const [y, row] of this.structure.entries())
            for (const [x, val] of row.entries())
                yield [new Point(x, y), val];
    };
    this.value = function(point) {
        try { return this.structure[point.y][point.x]; }
        catch (_) { return undefined; }
    };
    this.return;
}

function TileSet(sprite) {
    this.sprite = sprite;
    this.tileMovement = [
        undefined,
        undefined,
        (H) => { return H == "N" ? "N" : "S"; },
        (H) => { return H == "E" ? "E" : "W"; },
        (H) => { return H == "S" ? "E" : "N"; },
        (H) => { return H == "S" ? "W" : "N"; },
        (H) => { return H == "N" ? "E" : "S"; },
        (H) => { return H == "N" ? "W" : "S"; },
    ];
    this.getWidth = function() {
        return this.sprite.width;
    };
    this.getHeight = function() {
        return this.sprite.height;
    };
    this.draw = function(x, y, tileVal) {
        this.sprite.draw(tileVal % 4, Math.floor(tileVal / 4), x, y);
    };
    this.movement = function(tileVal, heading) {
        try { return this.tileMovement[tileVal](heading); }
        catch (e) {
            if (tileVal === undefined) throw "Off map";
            else if (this.tileMovement[tileVal] == undefined) throw "Off path";
            throw e;
        }
    };
    return this;
}
