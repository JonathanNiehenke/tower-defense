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
    this.sprites = {
        "towers": new Sprite(this.fgContext, "sprites/Towers.png", 27, 8),
        "roads": new Sprite(this.bgContext,  "sprites/IsoRoadSet_Kenney.png", 2, 4),
        "slime": new Sprite(this.fgContext, "sprites/SlimeIso.png", 4, 4),
    };
    this.map = new Map(
        new TileSet(this.sprites["roads"]), new IsoTangle(this.fgContext));
    this.enemies = new Enemies(this.sprites["slime"],
        new HealthBar(this.fgContext), this.map.movement.bind(this.map));
    this.defense = new DefenseNetwork(this.sprites["towers"],
        new Orb(this.fgContext), new IsoCircle(this.fgContext));
    this.init = function() {
        this.map.applyLevel(level.structure);
        level.waves.forEach(wave => wave.start = this.map.startPos(wave.start));
        this.enemies.newWaves(level.waves);
        this.defense.place(6, this.map.startPos([2, 2]));
        this.defense.place(1, this.map.startPos([6, 0]));
        this.canvas.addEventListener("mousemove", this.mouseMove.bind(this));
        this.canvas.addEventListener("mousedown", this.mouseDown.bind(this));
        this.canvas.addEventListener("mouseup", this.mouseUp.bind(this));
        this.drawFromMiddle(this.bgContext, this.map.draw.bind(this.map));
        this.animation = setInterval(this.loop.bind(this), 28);
    };
    this.loop = function() {
        this.update();
        this.drawFromMiddle(this.fgContext, this.drawForeground.bind(this));
    };
    this.update = function() {
        this.enemies.update();
        this.defense.update(
            this.enemies.positions.bind(this.enemies),
            this.enemies.hit.bind(this.enemies));
        try { this.enemies.updateWave(); }
        catch (_) { this.end(); }
    };
    this.drawFromMiddle = function(context, drawFunc) {
        context.save();
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        context.translate(this.canvas.width / 2, 0);
        drawFunc();
        context.restore();
    };
    this.drawForeground = function() {
        if (this.map.isMap(this.mouseToIso())) {
            this.map.highlightTileAt(this.mouseToIso());
            this.defense.highlightRangeAt(
                this.map.centerOfTileAt(this.mouseToIso()));
        }
        this.enemies.draw();
        this.defense.draw();
    };
    this.mouseMove = function(e) {
        let rect = this.canvas.getBoundingClientRect();
        this.mousePos.change(e.clientX - rect.x, e.clientY - rect.y);
    };
    this.mouseDown = function() {
        if (this.map.isMap(this.mouseToIso()))
            this.defense.upgradeAt(this.map.centerOfTileAt(this.mouseToIso()));
    };
    this.mouseUp = function() {
    };
    this.mouseToIso = function() {
        return new Point(this.mousePos.x - this.canvas.width / 2,
            this.mousePos.y, "isometric");
    };
    this.end = function() {
        clearInterval(this.animation);
        alert("Game Over");
    }
    return this;
}

