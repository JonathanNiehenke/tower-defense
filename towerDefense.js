function init() {
    let game = new Game(
        document.getElementById("bg"), document.getElementById("fg"));
    game.init();
}

function Game(bgCanvas, fgCanvas) {
    this.canvas = fgCanvas;
    this.bgContext = bgCanvas.getContext('2d');
    this.fgContext = fgCanvas.getContext('2d');
    this.mousePos = new Point(-1, -1);
    this.animation = undefined;
    this.levelNum = 0;
    this.sprites = {
        "slime": new Sprite(this.fgContext, "sprites/SlimeIso.png", 4, 4),
        "towers": new Sprite(this.fgContext, "sprites/Towers.png", 27, 8),
        "roads": new Sprite(this.bgContext,  "sprites/RoadSet_Kenney.png", 2, 4),
        "circle": new Circle(this.fgContext),
        "rectangle": new Rectangle(this.fgContext),
        "iroads": new Sprite(this.bgContext,  "sprites/IsoRoadSet_Kenney.png", 2, 4),
        "icircle": new IsoCircle(this.fgContext),
        "irectangle": new IsoRectangle(this.fgContext),
        "outline": new RoadOutline(this.bgContext, 64, 64, "black"),
    };
    this.map = new MapSlice(
        new IsoTileSet(this.sprites["iroads"], this.sprites["irectangle"], this.sprites["outline"]),
        this.sprites["rectangle"]);
    this.enemies = new Enemies(
        this.sprites["slime"], new HealthBar(this.fgContext),
        this.sprites["circle"], this.map.movement.bind(this.map));
    this.defense = new DefenseNetwork(
        this.sprites["towers"], new Orb(this.fgContext),
        new IsoCircle(this.fgContext), this.sprites["rectangle"]);
    this.towerMenu = new TowerMenu(
        new Point(20, 380), new Point(30, 0), this.sprites["towers"], 27/3);
    this.minimap = new MiniMap(new Point(600, 250), new Point(200, 200),
        2, this.map, this.enemies, this.defense, this.sprites["rectangle"]);
    this.init = function() {
        this.canvas.addEventListener("mousemove", this.mouseMove.bind(this));
        this.canvas.addEventListener("mousedown", this.mouseDown.bind(this));
        this.canvas.addEventListener("mouseup", this.mouseUp.bind(this));
        this.loadLevel(this.levelNum++);
    };
    this.loadLevel = function(num=0) {
        this.defense.clear();
        this.map.applyLevel(levels[num].structure);
        levels[num].waves.forEach(
            wave => wave.start = this.map.startPos(wave.start));
        this.enemies.newWaves(levels[num].waves);
        this.minimap.slice(new Point(0, 0));
        this.drawFromMiddle(this.bgContext, this.map.draw.bind(this.map));
        this.minimap.mapDraw();
        this.animation = setInterval(this.loop.bind(this), 28);
    };
    this.loop = function() {
        this.update();
        this.drawFromMiddle(this.fgContext, this.draw.bind(this));
        this.towerMenu.draw(this.mousePos);
        this.minimap.enemyDraw();
        this.minimap.towerDraw();
        this.minimap.viewDraw();
    };
    this.update = function() {
        this.enemies.update();
        this.defense.update(
            this.enemies.positions.bind(this.enemies),
            this.enemies.hit.bind(this.enemies));
        try { this.enemies.updateWave(); }
        catch (e) { this.catchEndLevel(e); }
    };
    this.catchEndLevel = function(error) {
        if (error === "end of level")
	        this.endLevel();
        else
            throw error;
    };
    this.endLevel = function() {
        clearInterval(this.animation);
        alert("Level complete");
        try { this.loadLevel(this.levelNum++) }
        catch (_) { this.end(); }
    };
    this.drawFromMiddle = function(context, drawFunc) {
        context.save();
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        context.translate(this.canvas.width / 2, 0);
        drawFunc();
        context.restore();
    };
    this.draw = function() {
        this.highlight(this.mousePos.sub(this.canvas.width / 2, 0));
        this.enemies.draw(
            this.map.isWithinSlice.bind(this.map),
            this.map.alignToSlice.bind(this.map));
        this.defense.draw(
            this.map.isWithinSlice.bind(this.map),
            this.map.alignToSlice.bind(this.map));
    };
    this.highlight = function(mouseIso) {
        if (!this.map.isMapSlice(mouseIso)) return;
        this.map.highlightTileAt(mouseIso);
        let towerPos = this.map.centerOfTileWithinMap(mouseIso, true);
        this.defense.highlightRangeAt(towerPos,
            this.map.alignToSlice.bind(this.map), this.map.scalingFactor());
        this.minimap.rangeDraw(towerPos);
    };
    this.mouseMove = function(e) {
        let rect = this.canvas.getBoundingClientRect();
        this.mousePos.change(e.clientX - rect.x, e.clientY - rect.y);
    };
    this.mouseDown = function() {
        const mouseIso = this.mousePos.sub(this.canvas.width / 2, 0);
        if (this.map.isMap(mouseIso)) {
            this.defense.upgradeAt(
                this.map.centerOfTileWithinMap(mouseIso, true));
        }
        this.towerMenu.mouseDown(this.mousePos);
        this.minimap.mouseDown(this.mousePos);
    };
    this.mouseUp = function() {
        const mouseIso = this.mousePos.sub(this.canvas.width / 2, 0);
        const type = this.towerMenu.mouseUpValue();
        if (type !== undefined && this.map.slicePointIs(mouseIso, 0)) {
            this.defense.place(
                type, this.map.centerOfTileWithinMap(mouseIso, true));
        }
    };
    this.end = function() {
        clearInterval(this.animation);
        alert("Game Over");
    };
    return this;
}

function MiniMap(origin, dims, sqrDivisions, map, enemies, defense, viewShape) {
    this.origin = origin;
    this.dims = dims;
    this.slicePos = this.size = undefined;
    this.viewDims = dims.div(sqrDivisions);
    this.viewPort = new Menu(this.origin, this.viewDims, viewShape);
    this.draw = function() {
        for (const [point, val] of this.structure.sliceIter(this.slice))
            this.tiles.draw(point.x * this.size, point.y * this.size, val);
    };
    this.mapDraw = function() {
        this.size = map.dimensions().x / dims.x;
        map.drawMini(this.origin, this.dims);
    };
    this.enemyDraw = function() {
        enemies.drawMini(this.origin, this.size);
    };
    this.towerDraw = function() {
        defense.drawMini(this.origin, this.size);
    };
    this.rangeDraw = function(towerPos) {
        defense.highlightMiniRangeAt(towerPos, this.origin, this.size);
    };
    this.viewDraw = function() {
        this.viewPort.draw(this.slicePos.x, this.slicePos.y, this.viewDims.x,
            this.viewDims.y, "black", "rgba(255, 255, 255, 0.375");
    };
    this.mouseDown = function(mousePos) {
        this.viewPort.mouseAction(mousePos, this.slice.bind(this))
    };
    this.slice = function(cell) {
        if (cell.x >= 0 && cell.y >= 0) {
            map.divide(sqrDivisions, this.slicePos = cell);
            map.draw();
        }
    };
    return this;
}
