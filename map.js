function Map(tiles, shape) {
    this.tiles = tiles;
    this.shape = shape;
    this.size = this.tiles.getWidth();
    this.steps = 50;
    this.directions = {
        "N": (new Point(0, -this.size / this.steps)),
        "S": (new Point(0, this.size / this.steps)),
        "E": (new Point(this.size / this.steps, 0)),
        "W": (new Point(-this.size / this.steps, 0)),
    };
    this.structure = new MapStructure();
    this.applyLevel = function(structure) {
        this.structure.new(structure);
    };
    this.draw = function() {
        for (const [point, val] of this.structure.iter())
            this.tiles.draw(point.x * this.size, point.y * this.size, val);
    };
    this.drawMini = function(origin, dims) {
        const sDims = this.structure.dimensions();
        const size  = new Point(dims.x / sDims.x, dims.y / sDims.y);
        for (const [point, val] of this.structure.iter()) {
            this.tiles.drawOutline(
                origin.x + point.x*size.x, origin.y + point.y*size.y, val, size.x);
        }
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
    this.isMap = function(point) {
        return this.tileValueAt(point) !== undefined;
    };
    this.pointIs = function(point, val) {
        return this.tileValueAt(point) === val;
    };
    this.tileValueAt = function(point) {
        return this.structure.value(this.gridPosAt(point));
    };
    this.startPos = function([x, y]) {
        return this.centerOfTileAt(this.toTile(new Point(x, y)));
    };
    this.centerOfTileAt = function(point) {
        return this.topOfTileAt(point).add(this.size / 2, this.size / 2);
    };
    this.topOfTileAt = function(point) {
        return this.toTile(this.gridPosAt(point));
    };
    this.toTile = function(gridPoint) {
        return gridPoint.multi(this.size);
    };
    this.gridPosAt = function(point) {
        return point.div(this.size).floor();
    };
    this.dimensions = function dimensions() {
        return this.structure.dimensions().multi(this.size);
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
    this.dimensions = function() {
        return new Point(this.structure[0].length, this.structure.length);
    };
    return this;
}

function TileSet(sprite, outline) {
    this.sprite = sprite;
    this.outline = outline;
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
        this.sprite.draw(x, y, tileVal % 4, Math.floor(tileVal / 4));
    };
    this.drawOutline = function(x, y, tileVal, size=64) {
        this.outline.draw(x, y, tileVal, size);
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
