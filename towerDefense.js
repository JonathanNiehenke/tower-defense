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
        "towers": new Sprite(this.fgContext, "sprites/Towers.png", 27, 8),
        "roads": new Sprite(this.bgContext,  "sprites/RoadSet_Kenney.png", 2, 4),
        "outline": new RoadOutline(this.bgContext, 64, 64, "black"),
        "slime": new Sprite(this.fgContext, "sprites/SlimeIso.png", 4, 4),
    };
    this.map = new Map(
        new TileSet(this.sprites["roads"], this.sprites["outline"]),
        new Rectangle(this.fgContext));
    this.enemies = new Enemies(
        this.sprites["slime"], new HealthBar(this.fgContext),
        new Circle(this.fgContext), this.map.movement.bind(this.map));
    this.defense = new DefenseNetwork(this.sprites["towers"],
        new Orb(this.fgContext), new Circle(this.fgContext));
    this.towerMenu = new TowerMenu(
        new Point(20, 380), new Point(30, 0), this.sprites["towers"], 27/3);
    this.minimap = new MiniMap(
        new Point(600, 250), new Point(200, 200), this.map, this.enemies);
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
        this.bgContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.map.draw();
        this.minimap.update();
        this.minimap.mapDraw();
        this.animation = setInterval(this.loop.bind(this), 28);
    };
    this.loop = function() {
        this.update();
        this.draw();
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
    this.draw = function() {
        this.fgContext.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.map.isMap(this.mousePos)) {
            this.map.highlightTileAt(this.mousePos);
            this.defense.highlightRangeAt(
                this.map.centerOfTileAt(this.mousePos));
        }
        this.enemies.draw();
        this.minimap.enemyDraw();
        this.defense.draw();
        this.towerMenu.draw(this.mousePos);
    };
    this.mouseMove = function(e) {
        let rect = this.canvas.getBoundingClientRect();
        this.mousePos.change(e.clientX - rect.x, e.clientY - rect.y);
    };
    this.mouseDown = function() {
        if (this.map.isMap(this.mousePos))
            this.defense.upgradeAt(this.map.centerOfTileAt(this.mousePos));
        this.towerMenu.mouseDown(this.mousePos);
    };
    this.mouseUp = function() {
        const type = this.towerMenu.mouseUpValue();
        if (type !== undefined && this.map.pointIs(this.mousePos, 0)) {
            this.defense.place(
                type, this.map.centerOfTileAt(this.mousePos));
        }
    };
    this.end = function() {
        clearInterval(this.animation);
        alert("Game Over");
    }
    return this;
}

function MiniMap(origin, dims, map, enemies) {
    this.origin = origin;
    this.dims = dims;
    this.size = undefined;
    this.update = function() {
        const mapDims = map.dimensions();
        this.size = Math.max(mapDims[0]/dims.x, mapDims[1]/dims.y);
    };
    this.mapDraw = function() {
        map.drawMini(this.origin, map.size/this.size);
    };
    this.enemyDraw = function() {
        enemies.drawMini(this.origin, this.size);
    };
    return this;
}
