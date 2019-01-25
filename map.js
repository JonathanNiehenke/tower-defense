function MapSlice(origin, map, tiles) {
    MapIllustrator.call(this, origin, map, tiles);
    this.dims = this.from = this.to = this.offset = undefined;
    this.draw = function() {
        for (const [point, val] of map.structure.sliceIter(this.from, this.to))
            this.tiles.draw(this.origin, point, val);
    };
    this.divide = function(div, point) {
        this.dims = map.structure.dimensions().div(div);
        this.from = new Point(point.x * this.dims.x, point.y * this.dims.y);
        this.to = this.from.add(this.dims.x, this.dims.y);
        this.offset = this.from.multi(map.scale);
    };
    this.isMap = function(mousePoint) {
        return this.isWithinSliceDims(this.gridPosAt(mousePoint));
    };
    this.isWithinSliceDims = function({x, y}) {
        return (this.dims.x > x && x >= 0 && this.dims.y > y && y >= 0);
    };
    this.pointIs = function(mousePoint, val) {
        return map.value(this.slicePointAt(mousePoint)) === val;
    };
    this.isWithinSlice = function(mapPoint) {
        const slicePoint = map.toGrid(mapPoint).sub(this.from.x, this.from.y);
        return this.isWithinSliceDims(slicePoint);
    };
    this.centerOfTileAt = function(mousePoint) {
        return map.centerOf(this.slicePointAt(mousePoint));
    };
    this.slicePointAt = function(point) {
        return this.gridPosAt(point).add(this.from.x, this.from.y);
    };
    this.align = function(mapPoint) {
        const slicePoint = mapPoint.sub(this.offset.x, this.offset.y);
        return this.tiles.align(slicePoint, this.map.scale).add(
            this.origin.x, this.origin.y);
    };
    return this;
}

function Map() {
    this.scale = 60;  // Multiple of 5, 4, 3 and 2 for 1/5th speed etc.
    this.structure = new MapStructure();
    this.motion = new PathMovement(this.scale);
    this.applyLevel = function(structure) {
        this.structure.new(structure);
    };
    this.movement = function(progress) {
        this.motion.move(progress, this.value(this.toGrid(progress.point)));
    };
    this.startPos = function([x, y]) {
        return this.toTile(new Point(x, y)).add(this.scale / 2, this.scale / 2);
    };
    this.centerOf = function(gridPoint) {
        return this.toTile(gridPoint).add(
            this.scale / 2, this.scale / 2);
    };
    this.topOfTileAt = function(point) {
        return this.toTile(this.toGrid(point));
    };
    this.value = function(gridPoint) {
        return this.structure.value(gridPoint);
    };
    this.toGrid = function(point) {
        return point.div(this.scale).floor();
    };
    this.toTile = function(gridPoint) {
        return gridPoint.multi(this.scale);
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

function PathMovement(scale) {
    this.directions = {
        "N": (new Point(0, -1)), "S": (new Point(0, 1)),
        "E": (new Point(1, 0)), "W": (new Point(-1, 0)),
    };
    this.paths = [
        undefined,
        undefined,
        (H) => { return H == "N" ? "N" : "S"; },
        (H) => { return H == "E" ? "E" : "W"; },
        (H) => { return H == "S" ? "E" : "N"; },
        (H) => { return H == "S" ? "W" : "N"; },
        (H) => { return H == "N" ? "E" : "S"; },
        (H) => { return H == "N" ? "W" : "S"; },
    ];
    this.move = function(progress, path) {
        if (progress.traveled % scale < progress.speed)
            progress.heading = this.heading(path, progress.heading);
        this.moveForward(progress);
    };
    this.heading = function(path, heading) {
        try { return this.paths[path](heading); }
        catch (e) {
            if (path === undefined) throw "Invalid path value";
            if (this.paths[path] === undefined) throw "Off path";
            throw e;
        }
    };
    this.moveForward = function(progress) {
        const trajectory = this.directions[progress.heading];
        progress.point.iAdd(trajectory.multi(progress.speed));
        progress.traveled += progress.speed;
    };
};

function MapIllustrator(origin, map, tiles) {
    this.origin = origin;
    this.map = map;
    this.tiles = tiles;
    this.draw = function() {
        for (const [point, val] of map.structure.iter())
            this.tiles.draw(this.origin, point, val);
    };
    this.highlightTileAt = function(point) {
        this.tiles.highlightAt(this.origin, point);
    };
    this.isMap = function(mousePoint) {
        return !this.pointIs(mousePoint, undefined);
    };
    this.pointIs = function(mousePoint, val) {
        return map.value(this.gridPosAt(mousePoint)) === val;
    };
    this.centerOfTileAt = function(mousePoint) {
        return map.centerOf(this.gridPosAt(mousePoint));
    };
    this.gridPosAt = function(mousePoint) {
        return this.tiles.toGrid(mousePoint)
    };
    this.scalingFactor = function() {
        return this.tiles.size/this.map.scale;
    };
    this.align = function(point) {
        return this.tiles.align(point, this.map.scale).add(
            this.origin.x, this.origin.y);
    };
    this.dimensions = map.dimensions.bind(map);
    return this;
}

function TileSet(sprite, highlight) {
    this.sprite = sprite;
    this.highlight = highlight;
    this.size = this.sprite.width;
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
    this.align = function(point, scale) {
        return point.multi(this.size/scale);
    };
    return this;
}

function IsoTileSet(sprite, highlight) {
    TileSet.call(this, sprite, highlight);
    this.size = this.sprite.width / 2;
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
