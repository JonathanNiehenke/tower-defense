function MapObj(tiles, shape) {
    this.tiles = tiles;
    this.shape = shape;
    this.size = this.tiles.getWidth() / 2;
    this.directions = {
        "N": (new PointObj(0, -this.size/20)).convert(),
        "S": (new PointObj(0, this.size/20)).convert(),
        "E": (new PointObj(this.size/20, 0)).convert(),
        "W": (new PointObj(-this.size/20, 0)).convert(),
    };
    this.structure = new MapStructureObj();
    this.startPoint = this.initialHeading = undefined;
    this.applyLevel = function(level) {
        this.structure.new(level.mapArray);
        this.startPoint = this.centerOfTileAt(this.toIso(level.startTile));
        this.initialHeading = level.initialHeading;
    };
    this.draw = function() {
        for (const [point, val] of this.structure.iter()) {
            const iPoint = this.toIso(point);
            this.tiles.draw(iPoint.x - this.size, iPoint.y, val);
        }
    };
    this.highlightTileAt = function(gridPoint) {
        const iPoint = this.topOfTileAt(gridPoint);
        this.shape.draw(iPoint.x, iPoint.y, this.size, this.size,
            "silver",  "rgba(255, 255, 255, 0.20)");
    };
    this.heading = function(point, heading) {
        return this.tiles.movement(this.tileValueAt(point), heading);
    };
    this.isMap = function(isoPoint) {
        return this.tileValueAt(isoPoint) !== undefined;
    };
    this.tileValueAt = function(isoPoint) {
        return this.structure.value(this.gridPosAt(isoPoint));
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

function MapStructureObj() {
    this.structure = [];
    this.new = function(structure) {
        this.structure = structure;
    };
    this.iter = function*() {
        for (const [y, row] of this.structure.entries())
            for (const [x, val] of row.entries())
                yield [new PointObj(x, y), val];
    };
    this.value = function(point) {
        try { return this.structure[point.y][point.x]; }
        catch { return undefined; }
    };
    this.return;
}

function TileSetObj(sprite) {
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
        return this.tileMovement[tileVal](heading);
    };
    return this;
}

