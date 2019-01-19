function MapSlice(drawnOrigin, tiles, shape) {
    Map.call(this, drawnOrigin, tiles, shape);
    this.dims = this.from = this.to = this.offset = undefined;
    this.draw = function() {
        for (const [point, val] of this.structure.sliceIter(this.from, this.to))
            this.tiles.draw(this.drawnOrigin, point, val);
    };
    this.divide = function(div, point) {
        this.dims = this.structure.dimensions().div(div);
        this.from = new Point(point.x * this.dims.x, point.y * this.dims.y);
        this.to = this.from.add(this.dims.x, this.dims.y);
        this.offset = this.from.multi(this.scale);
    };
    this.isMapSlice = function(point) {
        const gridPoint = this.gridPosAt(point, true);
        return (this.dims.x > gridPoint.x && gridPoint.x >= 0 &&
            this.dims.y > gridPoint.y && gridPoint.y >= 0);
    };
    this.isWithinSlice = function(point) {
        return this.isWithinGridSlice(this.gridPosAt(point));
    };
    this.isWithinGridSlice = function(gridPoint) {
        return (this.to.x > gridPoint.x && gridPoint.x >= this.from.x &&
            this.to.y > gridPoint.y && gridPoint.y >= this.from.y);
    };
    this.centerOfTileWithinMap = function(point, fromMouse=false) {
        return this.toTile(this.slicePointAt(point, true)).add(
            this.scale / 2, this.scale / 2);
    };
    this.slicePointIs = function(point, val) {
        const gridPoint = this.slicePointAt(point, true);
        if (this.isWithinGridSlice(gridPoint))
            return this.structure.value(gridPoint) === val;
        return false;
    };
    this.slicePointAt = function(point, fromMouse=false) {
        return this.gridPosAt(point, fromMouse).add(this.from.x, this.from.y);
    };
    this.alignToSlice = function(point) {
        return this.align(point.sub(this.offset.x, this.offset.y));
    };
    return this;
}

function Map(drawnOrigin, tiles, shape) {
    this.drawnOrigin = drawnOrigin;
    this.tiles = tiles;
    this.shape = shape;
    this.scale = 60;  // Multiple of 5, 4, 3 and 2 for 1/5th speed etc.
    this.directions = {
        "N": (new Point(0, -1)), "S": (new Point(0, 1)),
        "E": (new Point(1, 0)), "W": (new Point(-1, 0)),
    };
    this.structure = new MapStructure();
    this.applyLevel = function(structure) {
        this.structure.new(structure);
    };
    this.draw = function() {
        for (const [point, val] of this.structure.iter())
            this.tiles.draw(this.drawnOrigin, point, val);
    };
    this.drawMini = function(origin, dims) {
        const sDims = this.structure.dimensions();
        const size  = new Point(dims.x / sDims.x, dims.y / sDims.y);
        for (const [point, val] of this.structure.iter()) {
            this.tiles.drawOutline(
                origin.x + point.x*size.x, origin.y + point.y*size.y, val, size.x);
        }
    };
    this.highlightTileAt = function(point) {
        this.tiles.highlightAt(this.drawnOrigin, point);
    };
    this.movement = function(progress) {
        if (progress.traveled % this.scale < progress.speed)
            progress.heading = this.heading(progress.point, progress.heading);
        const trajectory = this.directions[progress.heading];
        progress.point.iAdd(trajectory.multi(progress.speed));
        progress.traveled += progress.speed;
    };
    this.heading = function(point, heading) {
        return this.tiles.movement(this.tileValueAt(point), heading);
    };
    this.isMap = function(mousePoint) {
        return this.tileValueAt(mousePoint, true) !== undefined;
    };
    this.pointIs = function(mousePoint, val) {
        return this.tileValueAt(mousePoint, true) === val;
    };
    this.tileValueAt = function(point, fromMouse=false) {
        return this.structure.value(this.gridPosAt(point, fromMouse));
    };
    this.startPos = function([x, y]) {
        return this.toTile(new Point(x, y)).add(this.scale / 2, this.scale / 2);
    };
    this.centerOfTileAt = function(point, fromMouse=false) {
        return this.topOfTileAt(point, fromMouse).add(
            this.scale / 2, this.scale / 2);
    };
    this.topOfTileAt = function(point, fromMouse=false) {
        return this.toTile(this.gridPosAt(point, fromMouse));
    };
    this.toTile = function(gridPoint) {
        return gridPoint.multi(this.scale);
    };
    this.gridPosAt = function(point, fromMouse=false) {
        return (fromMouse
            ? this.tiles.toGrid(point) : point.div(this.scale).floor());
    };
    this.scalingFactor = function() {
        return this.tiles.size/this.scale;
    };
    this.align = function(point) {
        return this.tiles.align(point, this.scale).add(
            this.drawnOrigin.x, this.drawnOrigin.y);
    };
    this.dimensions = function dimensions() {
        return this.structure.dimensions().multi(this.scale);
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
    this.sliceIter = function*(from, to) {
        for (const [y, row] of this.structure.slice(from.y, to.y).entries())
            for (const [x, val] of row.slice(from.x, to.x).entries())
                yield [new Point(x, y), val];
    }
    this.value = function(point) {
        try { return this.structure[point.y][point.x]; }
        catch (_) { return undefined; }
    };
    this.dimensions = function() {
        return new Point(this.structure[0].length, this.structure.length);
    };
    return this;
}

function TileSet(sprite, highlight, outline) {
    this.sprite = sprite;
    this.highlight = highlight;
    this.outline = outline;
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
    this.draw = function(origin, point, tileVal) {
        const {x, y} = this.toTile(point).add(origin.x, origin.y);
        this.sprite.draw(x, y, tileVal % 4, Math.floor(tileVal / 4));
    };
    this.highlightAt = function(origin, point) {
        const {x, y} = this.toTile(this.toGrid(point)).add(origin.x, origin.y);
        this.highlight.draw(x, y, this.size, this.size,
            "silver",  "rgba(255, 255, 255, 0.20)");
    };
    this.toGrid = function(point) {
        return point.div(this.size).floor();
    };
    this.toTile = function(point) {
        return point.multi(this.size);
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
    this.align = function(point, scale) {
        return point.multi(this.size/scale);
    };
    return this;
}

function IsoTileSet(sprite, highlight, outline) {
    TileSet.call(this, sprite, highlight, outline);
    this.size = this.sprite.width / 2;
    this.drawnDims = function([x, y]) {
        this.offset.change(y * this.size, 0);
    };
    this.draw = function(origin, point, tileVal) {
        const {x, y} = this.toTile(point).add(origin.x - this.size, origin.y);
        this.sprite.draw(x, y, tileVal % 4, Math.floor(tileVal / 4));
    };
    this.toGrid = function(point) {
        return this.toCartesian(point).div(this.size).floor();
    };
    this.toTile = function(point) {
        return this.toIsometric(point.multi(this.size));
    };
    this.align = function(point, scale) {
        return this.toIsometric(point).multi(this.size/scale);
    };
    this.toIsometric = function({x, y}) {
        return new Point(x - y, (x + y) / 2);
    };
    this.toCartesian = function({x, y}) {
        return new Point(x / 2 + y, y - x / 2);
    };
    return this;
}
