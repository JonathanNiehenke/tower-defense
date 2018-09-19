function init() {
    let game = new GameObj(document.querySelector("CANVAS"));
    game.init();
}

function GameObj(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.mousePos = new PointObj(-1, -1);
    this.clickedTower = this.animation = undefined;
    this.sprites = {
        "towers": new SpriteObj(this.context, "sprites/Towers.png", 27, 8),
        "roads": new SpriteObj(this.context,  "sprites/IsoRoadSet_Kenney.png", 2, 4),
        "slime": new SpriteObj(this.context, "sprites/SlimeIso.png", 4, 4),
        "balls": new SpriteObj(this.context, "sprites/Energy Ball.png", 8, 12),
    };
    this.towerMenu = new MenuDisplayObj(
        this.sprites["towers"], new PointObj(20, 380), new PointObj(30, 0));
    this.map = new MapObj(
        new TileSetObj(this.sprites["roads"]),
        new IsoTangle(this.context));
    this.enemies = new EnemeiesObj(new HealthBar(this.context));
    this.towers = [];
    // 62.5 - 25, avg44
    this.towerVariations = [
        // cannon
        {"damage": 8, "range": 42, "pAmount": 1, "pSize": 25, "reload": 75, "speed": 6},
        {"damage": 12, "range": 42, "pAmount": 1, "pSize": 25, "reload": 75, "speed": 6},
        {"damage": 16, "range": 42, "pAmount": 1, "pSize": 25, "reload": 75, "speed": 6},
        // flame
        {"damage": 0.2, "range": 42, "pAmount": 20, "pSize": 10, "reload": 0, "speed": 6},
        {"damage": 0.35, "range": 42, "pAmount": 20, "pSize": 10, "reload": 0, "speed": 6},
        {"damage": 0.5, "range": 42, "pAmount": 20, "pSize": 10, "reload": 0, "speed": 6},
        // tesla
        {"damage": 0.3, "range": 42, "pAmount": 20, "pSize": 10, "reload": 0, "speed": 6},
        {"damage": 0.3, "range": 52, "pAmount": 20, "pSize": 10, "reload": 0, "speed": 6},
        {"damage": 0.3, "range": 62, "pAmount": 20, "pSize": 10, "reload": 0, "speed": 6},
        // egg gun
        {"damage": 4, "range": 48, "pAmount": 3, "pSize": 25, "reload": 30, "speed": 2},
        {"damage": 4, "range": 48, "pAmount": 3, "pSize": 25, "reload": 25, "speed": 2},
        {"damage": 4, "range": 48, "pAmount": 3, "pSize": 25, "reload": 20, "speed": 2},
        // machine gun
        {"damage": 0.5, "range": 62, "pAmount": 6, "pSize": 10, "reload": 6, "speed": 6},
        {"damage": 1.0, "range": 62, "pAmount": 6, "pSize": 10, "reload": 6, "speed": 6},
        {"damage": 1.5, "range": 62, "pAmount": 6, "pSize": 10, "reload": 6, "speed": 6},
        // untitled
        {"damage": 8, "range": 62, "pAmount": 6, "pSize": 8, "reload": 15, "speed": 2},
        {"damage": 8, "range": 62, "pAmount": 6, "pSize": 8, "reload": 15, "speed": 4},
        {"damage": 8, "range": 62, "pAmount": 6, "pSize": 8, "reload": 15, "speed": 6},
        // missile
        {"damage": 3, "range": 80, "pAmount": 6, "pSize": 25, "reload": 30, "speed": 12},
        {"damage": 3, "range": 120, "pAmount": 6, "pSize": 25, "reload": 30, "speed": 12},
        {"damage": 3, "range": 160, "pAmount": 6, "pSize": 25, "reload": 30, "speed": 12},
        // shotgun
        {"damage": 4, "range": 48, "pAmount": 3, "pSize": 25, "reload": 30, "speed": 5},
        {"damage": 4, "range": 48, "pAmount": 3, "pSize": 30, "reload": 30, "speed": 5},
        {"damage": 4, "range": 48, "pAmount": 3, "pSize": 35, "reload": 30, "speed": 5},
        // untitled2
        {"damage": 4, "range": 60, "pAmount": 6, "pSize": 10, "reload": 30, "speed": 8},
        {"damage": 4, "range": 80, "pAmount": 6, "pSize": 10, "reload": 30, "speed": 8},
        {"damage": 4, "range": 100, "pAmount": 6, "pSize": 10, "reload": 30, "speed": 8},
    ];
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
    };
    this.draw = function() {
        this.context.save();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < 9; ++i)
            this.towerMenu.draw(6, i*3, new PointObj(i, 0));
        this.context.translate(this.canvas.width / 2, 0);
        this.map.draw();
        if (this.map.isMap(this.mouseToIso())) {
            this.map.highlightTileAt(this.mouseToIso());
            let tileCenter = this.map.centerOfTileAt(this.mouseToIso());
            let tower = this.getTowerAtPoint(tileCenter);
            if (tower)
                tower.highlightRange();
        }
        this.enemies.draw();
        for (tower of this.towers)
            tower.draw();
        this.context.restore();
        if (this.clickedTower !== undefined)
            this.clickedTower.draw(this.mousePos);
    };
    this.mouseMove = function(e) {
        let rect = canvas.getBoundingClientRect();
        this.mousePos.change(e.clientX - rect.x, e.clientY - rect.y);
    };
    this.mouseDown = function() {
        let clicked = this.towerMenu.cellClicked(this.mousePos);
        if (clicked.cell.y === 0 && clicked.cell.x >= 0 && clicked.cell.x < 9)
        {
            this.clickedTower = new TowerObj(
                this.sprites["towers"], clicked.innerPos, clicked.cell.x * 3,
                this.towerVariations, new IsoCircle(this.context), false,
                this.sprites.balls);
        }
        else if (this.map.isMap(this.mouseToIso())) {
            let tileCenter = this.map.centerOfTileAt(this.mouseToIso());
            let tower = this.getTowerAtPoint(tileCenter);
            if (tower)
                tower.upgrade();
        }
    };
    this.mouseUp = function() {
        if (this.clickedTower !== undefined &&
            this.map.tileValueAt(this.mouseToIso()) === 0)
        {
            let tileCenter = this.map.centerOfTileAt(this.mouseToIso());
            let tower = this.getTowerAtPoint(tileCenter);
            if (!tower) {
                this.clickedTower.setPoint(tileCenter);
                this.clickedTower.isEmitterOn = true;
                this.towers.push(this.clickedTower);
            }
        }
        this.clickedTower = undefined;
    };
    this.mouseToIso = function() {
        return new PointObj(this.mousePos.x - this.canvas.width / 2,
            this.mousePos.y, "isometric");
    };
    this.getTowerAtPoint = function(point) {
        for (let tower of this.towers) {
            if (tower.point.equals(point.x, point.y))
                return tower;
        }
        return undefined;
    };
    this.end = function() {
        clearInterval(this.animation);
        alert("Game Over");
    }
    return this;
}

