function init() {
    let game = new GameObj(document.querySelector("CANVAS"));
    game.init();
}

function GameObj(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.mousePos = new PointObj(-1, -1);
    this.animation = undefined;
    this.sprites = {
        "towers": new SpriteObj(this.context, "sprites/Towers.png", 27, 8),
        "roads": new SpriteObj(this.context,  "sprites/IsoRoadSet_Kenney.png", 2, 4),
        "slime": new SpriteObj(this.context, "sprites/SlimeIso.png", 4, 4),
    };
    this.map = new MapObj(
        new TileSetObj(this.sprites["roads"]),
        new IsoTangle(this.context));
    this.enemies = new EnemeiesObj(new HealthBar(this.context));
    this.defense = new DefenseNetworkObj(
        this.sprites.towers, new Orb(this.context), new IsoCircle(this.context));
    // 62.5 - 25, avg44
    this.init = function() {
        this.map.applyLevel({
            "mapArray": [
                [0, 6, 3, 3, 3, 7, 0],
                [0, 2, 0, 0, 0, 4, 7],
                [0, 2, 0, 0, 0, 0, 2],
                [3, 5, 0, 6, 7, 0, 2],
                [0, 0, 0, 2, 4, 3, 5],
                [0, 0, 0, 2, 0, 0, 0],
                [3, 3, 3, 5, 0, 0, 0]
            ],
            "startTile": new PointObj(0, 6),
        });
        let slime = this.sprites["slime"];
        this.enemies.newWaves([
            {"sprite": slime, "amount": 6, "start": this.map.start,
             "heading": "E", "spacing": 35, "speed": 1, "health": 100},
            {"sprite": slime, "amount": 6, "start": this.map.start,
             "heading": "E", "spacing": 20, "speed": 2, "health": 100},
            {"sprite": slime, "amount": 6, "start": this.map.start,
             "heading": "E", "spacing": 10, "speed": 1, "health": 100},
            {"sprite": slime, "amount": 24, "start": this.map.start,
             "heading": "E", "spacing": 10, "speed": 0.5, "health": 100},
        ]);
        let point = this.map.centerOfTileAt(
            this.map.toIso(new PointObj(2, 2)));
        this.defense.place(6, point);
        point = this.map.centerOfTileAt(
            this.map.toIso(new PointObj(6, 0)));
        this.defense.place(1, point);
        this.canvas.addEventListener("mousemove", this.mouseMove.bind(this));
        this.canvas.addEventListener("mousedown", this.mouseDown.bind(this));
        this.canvas.addEventListener("mouseup", this.mouseUp.bind(this));
        this.animation = setInterval(this.loop.bind(this), 28);
    };
    this.loop = function() {
        try { this.update(); }
        catch { this.end(); }
        this.draw();
    };
    this.update = function() {
        this.enemies.update(this.map.heading.bind(this.map), this.map.directions);
        this.defense.fireUpon(this.enemies.positions.bind(this.enemies));
    };
    this.draw = function() {
        this.context.save();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.translate(this.canvas.width / 2, 0);
        this.map.draw();
        if (this.map.isMap(this.mouseToIso())) {
            this.map.highlightTileAt(this.mouseToIso());
            this.defense.highlightRangeAt(
                this.map.centerOfTileAt(this.mouseToIso()));
        }
        this.enemies.draw();
        this.defense.draw();
        this.context.restore();
    };
    this.mouseMove = function(e) {
        let rect = canvas.getBoundingClientRect();
        this.mousePos.change(e.clientX - rect.x, e.clientY - rect.y);
    };
    this.mouseDown = function() {
        if (this.map.isMap(this.mouseToIso()))
            this.defense.upgradeAt(this.map.centerOfTileAt(this.mouseToIso()));
    };
    this.mouseUp = function() {
    };
    this.mouseToIso = function() {
        return new PointObj(this.mousePos.x - this.canvas.width / 2,
            this.mousePos.y, "isometric");
    };
    this.end = function() {
        clearInterval(this.animation);
        alert("Game Over");
    }
    return this;
}

