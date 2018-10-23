function TowerMenu(sprite, origin, spacing, displayNum) {
    this.menu = new Menu(sprite, origin, spacing);
    this.displayNum = displayNum;
    this.clicked = undefined;
    this.draw = function(mousePos) {
        this.drawDrag(mousePos);
        for (let i = 0; i < this.displayNum; ++i)
            this.menu.draw(0, i*3, i, 0);
    };
    this.drawDrag = function(mousePos) {
        if (this.clicked === undefined) return;
        const drawPos = mousePos.sub(this.clicked.pos.x, this.clicked.pos.y);
        sprite.draw(0, this.clicked.value * 3, drawPos.x, drawPos.y);
    };
    this.mouseDown = function(mousePos) {
        const diff = mousePos.sub(origin.x, origin.y);
        const cell = diff.div(
            this.menu.cellWidth, this.menu.cellHeight).floor();
        if (this.withinMenu(cell)) {
            this.clicked = {"value": cell.x, "pos": new Point(
                diff.x % this.menu.cellWidth, diff.y % this.menu.cellHeight)};
        }
    };
    this.withinMenu = function(cell) {
        return cell.y == 0 && cell.x >= 0 && cell.x < this.displayNum;
    };
    this.mouseUpValue = function() {
        if (this.clicked === undefined) return;
        const value = this.clicked.value;
        this.clicked = undefined;
        return value;
    };
    return this;
}

function Menu(sprite, origin, spacing) {
    this.sprite = sprite;
    this.origin = origin;
    this.cellWidth = sprite.width + spacing.x;
    this.cellHeight = sprite.height + spacing.y;
    this.draw = function(sheetX, sheetY, menuX, menuY) {
        const drawPos = this.origin.add(
            menuX * this.cellWidth, menuY * this.cellHeight);
        this.sprite.draw(sheetX, sheetY, drawPos.x, drawPos.y);
    };
    return this;
}

