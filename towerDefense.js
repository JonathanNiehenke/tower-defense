function GameObj(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.frame = 0;
    this.mousePos = new PointObj(-1, -1);
    this.clickedTower = undefined;
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
    this.waves = [], this.towers = [];
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
    this.mouseToIso = function() {
        return new PointObj(this.mousePos.x - this.canvas.width / 2,
            this.mousePos.y, "isometric");
    };
    this.mouseMove = function(e) {
        let rect = canvas.getBoundingClientRect();
        this.mousePos.change(e.clientX - rect.x, e.clientY - rect.y);
    };
    this.getTowerAtPoint = function(point) {
        for (let tower of this.towers) {
            if (tower.point.equals(point.x, point.y))
                return tower;
        }
        return undefined;
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
            "initialHeading": "E",
        });
        this.canvas.addEventListener("mousemove", this.mouseMove.bind(this));
        this.canvas.addEventListener("mousedown", this.mouseDown.bind(this));
        this.canvas.addEventListener("mouseup", this.mouseUp.bind(this));
    };
    this.getNewCreepHeading = function(creep) {
        return this.map.heading(creep.point, creep.heading);
    };
    this.update = function() {
        for (wave of this.waves) {
            wave.update(this.frame, 20,
                        this.getNewCreepHeading.bind(this), this.map.directions);
        }
        for(tower of this.towers) {
            for(wave of this.waves) {
                for(creep of wave.creeps) {
                    for (let particle of tower.emitter.getLiveParticles()) {
                        if(creep.point.distFrom(particle.location) < tower.pSize) {
                            particle.lifespan = 0;
                            creep.health -= tower.damage;
                        }
                    }
                    if(tower.point.distFrom(creep.point) < tower.range) {
                        tower.setTarget(creep.point);
                        let direction = creep.point.sub(
                            tower.point.x, tower.point.y).normalize();
                        tower.emitter.direction = direction.multi(tower.speed);
                        if (tower.currentReload <= 0) {
                            tower.emitter.addparticle();
                            tower.currentReload = tower.reload;
                        }
                        break;
                    }
                }
            }
            --tower.currentReload;
            tower.emitter.update();
        }
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
        for (let i = 0; i < this.waves.length; ++i) {
            let wave = this.waves[i];
            if (wave.creeps.length > 0)
                wave.draw(this.context);
            else if (wave.created == wave.creationAmount)
                this.waves.splice(i--, 1);  // Remove and prevent skipping
        }
        for (tower of this.towers)
            tower.draw();
        this.context.restore();
        if (this.clickedTower !== undefined)
            this.clickedTower.draw(this.mousePos);
    };
    this.loop = function() {
        if (this.waves.length == 0 && this.frame % 50 == 0) {
            let create = Math.floor(Math.random() * 7) + 4;  // 4 - 10
            let spacing = Math.floor(Math.random() * 70) + 30;  // 30 - 99
            let health = 250 / create;
            let wave = new WaveObj( this.sprites["slime"], create,
                this.map.startPoint, this.map.initialHeading, spacing, health,
                new HealthBar(this.context));
            this.waves.push(wave);
        }
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
