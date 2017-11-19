function GameObj(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.frame = 0;
    this.mouseGridPos = new PointObj(-1, -1);
    this.sprites = {
        "cannon": new SpriteObj(this.context, "sprites/CannonMap.png", 3, 8),
        "roads": new SpriteObj(this.context,  "sprites/tileSheet.png", 2, 4),
        "slime": new SpriteObj(this.context, "sprites/SlimeIso.png", 4, 4),
    };
    this.map = new MapObj(new TileSetObj(this.sprites["roads"]));
    this.towerMenu = new MenuDisplayObj(
        this.sprites["cannon"], new PointObj(600, 300), new PointObj(30, 0));
    this.isometricSize = this.map.isometricSize;
    this.waves = [], this.towers = [];
    this.mouseToGrid = function(e) {
        let rect = canvas.getBoundingClientRect();
        let mousePos = new PointObj(e.clientX - rect.x - this.canvas.width / 2,
                                    e.clientY - rect.y, "isometric");
        return this.map.getGridPos(mousePos);
    };
    this.mouseMove = function(e) {
        this.mouseGridPos = this.mouseToGrid(e);
    };
    this.highlightTile = function(gPoint) {
        let iPoint = this.map.gridToIso(gPoint);
        this.context.strokeStyle = "silver";
        this.context.fillStyle = "rgba(255, 255, 255, 0.20)";
        this.context.beginPath();
        this.context.moveTo(iPoint.x, iPoint.y);
        this.context.lineTo(iPoint.x + 50, iPoint.y + 25);
        this.context.lineTo(iPoint.x, iPoint.y + 50);
        this.context.lineTo(iPoint.x - 50, iPoint.y + 25);
        this.context.closePath();
        this.context.stroke();
        this.context.fill();
    };
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
            "startPoint": new PointObj(0, 6),
            "initialHeading": "E",
        });
        let wave = new WaveObj(this.sprites["slime"], 6, this.map.startPoint,
                               this.map.initialHeading);
        this.waves.push(wave);
        this.canvas.addEventListener("mousemove", this.mouseMove.bind(this));
    };
    this.getNewCreepHeading = function(creep) {
        let gridPos = this.map.getGridPos(creep.point);
        return this.map.getNewHeading(gridPos, creep.heading);
    };
    this.update = function() {
        for (wave of this.waves) {
            wave.update(this.frame, this.isometricSize,
                        this.getNewCreepHeading.bind(this), this.map.directions);
        }
    };
    this.draw = function() {
        this.context.save();
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let i = 0; i < 3; ++i)
            this.towerMenu.draw(5, i, new PointObj(i, 0));
        this.context.translate(this.canvas.width / 2, 0);
        this.map.draw();
        if (this.map.isMap(this.mouseGridPos))
            this.highlightTile(this.mouseGridPos);
        for (wave of this.waves)
            wave.draw();
        for (tower of this.towers)
            tower.draw();
        this.context.restore();
    };
    this.loop = function() {
        this.update();
        this.draw();
        ++this.frame;
    };
    return this;
}

function init() {
    let game = new GameObj(document.querySelector("CANVAS"));
    game.init();
    setInterval(game.loop.bind(game), 30);
}
