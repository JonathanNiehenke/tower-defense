function MapObj(tiles, shape) {
    this.tiles = tiles;
    this.directions = {
        "N": (new PointObj(0, -1)).convert(),
        "S": (new PointObj(0, 1)).convert(),
        "E": (new PointObj(1, 0)).convert(),
        "W": (new PointObj(-1, 0)).convert(),
    };
    this.shape = shape;
    this.size = this.tiles.getWidth() / 2;
    this.mapArray = this.startPoint = this.initialHeading = undefined;
    this.applyLevel = function(level) {
        this.mapArray = level.mapArray;
        this.startPoint = this.centerOfTileAt(level.startTile.multi(this.size));
        this.initialHeading = level.initialHeading;
    };
    this.centerOfTileAt = function(isoPoint) {
        return this.topOfTileAt(isoPoint).add(0, this.size / 2);
    };
    this.topOfTileAt = function(isoPoint) {
        return this.gridPosAt(isoPoint).multi(this.size).convert();
    };
    this.draw = function() {
        let rowAmount = this.mapArray.length, colAmount = this.mapArray[0].length;
        let iPoint, gridVal;
        for (x = 0; x < rowAmount; ++x) {
            for (y = 0; y < colAmount; ++y) {
                iPoint = (new PointObj(y, x)).convert().multi(this.size);
                gridVal = this.mapArray[x][y];
                this.tiles.draw(iPoint.x - this.size, iPoint.y, gridVal);
            }
        }
    };
    this.highlightTileAt = function(gridPoint) {
        const iPoint = this.topOfTileAt(gridPoint);
        this.shape.draw(iPoint.x, iPoint.y, this.size, this.size,
            "silver",  "rgba(255, 255, 255, 0.20)");
    };
    this.gridPosAt = function(Point) {
        Point = Point.type == "Cartesian" ? Point : Point.convert();
        return Point.fdiv(this.size);
    };
    this.heading = function(point, heading) {
        const tileValue = this.tileValueAt(point);
        return this.tiles.movement(tileValue, heading);
    };
    this.tileValueAt = function(Point) {
        let gridPoint = this.gridPosAt(Point);
        return this.mapArray[gridPoint.y][gridPoint.x];
    };
    this.isMap = function(isoPoint) {
        let gridPoint = this.gridPosAt(isoPoint);
        try { return this.mapArray[gridPoint.y][gridPoint.x] !== undefined; }
        catch (e) { return false; }  // caused by first index
    };
    return this;
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

