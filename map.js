function Map(tiles) {
    this.tiles = tiles;
    this.size = this.tiles.size;
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
            this.tiles.draw(point, val);
    };
    this.highlightTileAt = function(point) {
        this.tiles.highlightAt(point);
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
        return this.structure.value(this.tiles.toGrid(point)) !== undefined;
    };
    this.pointIs = function(point, val) {
        return this.structure.value(this.tiles.toGrid(point)) === val;
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
    this.align = function(point) {
        return this.tiles.align(point);
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

function TileSet(sprite, highlight) {
    this.sprite = sprite;
    this.highlight = highlight;
    this.size = this.sprite.width;
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
    this.draw = function(point, tileVal) {
        const drawPos = this.toTile(point);
        this.sprite.draw(
            tileVal % 4, Math.floor(tileVal / 4), drawPos.x, drawPos.y);
    };
    this.highlightAt = function(point) {
        const drawPos = this.toTile(this.toGrid(point));
        this.highlight.draw(drawPos.x, drawPos.y, this.size, this.size,
            "silver",  "rgba(255, 255, 255, 0.20)");
    };
    this.toGrid = function(point) {
        return point.div(this.size).floor();
    };
    this.toTile = function(point) {
        return point.multi(this.size);
    };
    this.movement = function(tileVal, heading) {
        try { return this.tileMovement[tileVal](heading); }
        catch (e) {
            if (tileVal === undefined) throw "Off map";
            else if (this.tileMovement[tileVal] == undefined) throw "Off path";
            throw e;
        }
    };
    this.align = function(point) {
        return point;
    };
    return this;
}

function IsoTileSet(sprite, highlight) {
    this.__proto__ = new TileSet(sprite, highlight);
    this.size = this.sprite.width / 2;
    this.drawnDims = function([x, y]) {
        this.offset.change(y * this.size, 0);
    };
    this.draw = function(point, tileVal) {
        const drawPos = this.toTile(point);
        this.sprite.draw(
            tileVal % 4, Math.floor(tileVal / 4),
            drawPos.x - this.size, drawPos.y);
    };
    this.toGrid = function(point) {
        return this.toCartesian(point).div(this.size).floor();
    };
    this.toTile = function(point) {
        return this.toIsometric(point.multi(this.size));
    };
    this.align = function(point) {
        return this.toIsometric(point);
    };
    this.toIsometric = function(point) {
        return new Point(point.x - point.y, (point.x + point.y) / 2);
    };
    this.toCartesian = function(point) {
        return new Point(point.x / 2 + point.y, point.y - point.x / 2);
    };
    return this;
}
