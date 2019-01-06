function TowerMenu(origin, spacing, sprite, displayNum) {
    this.menu = new Menu(origin, spacing, sprite);
    this.displayNum = displayNum;
    this.dragged = undefined;
    this.draw = function(mousePos) {
        this.drawDrag(mousePos);
        for (let i = 0; i < this.displayNum; ++i)
            this.menu.draw(i, 0, 0, i*3);
    };
    this.drawDrag = function(mousePos) {
        if (this.dragged === undefined) return;
        const drawPos = mousePos.sub(this.dragged.pos.x, this.dragged.pos.y);
        sprite.draw(drawPos.x, drawPos.y, 0, this.dragged.value * 3);
    };
    this.mouseDown = function(mousePos) {
        const diff = mousePos.sub(origin.x, origin.y);
        const cell = diff.div(
            this.menu.cellWidth, this.menu.cellHeight).floor();
        const pos = new Point(
            diff.x % this.menu.cellWidth, diff.y % this.menu.cellHeight);
        if (this.withinMenu(cell) && this.onSprite(pos))
            this.dragged = {"value": cell.x, "pos": pos};
    };
    this.withinMenu = function(cell) {
        return cell.y == 0 && cell.x >= 0 && cell.x < this.displayNum;
    };
    this.onSprite = function(pos) {
        return pos.x <= sprite.width;
    };
    this.mouseUpValue = function() {
        if (this.dragged === undefined) return;
        const value = this.dragged.value;
        this.dragged = undefined;
        return value;
    };
    return this;
}

function Menu(origin, spacing, sprite) {
    this.origin = origin;
    this.cellWidth = sprite.width + spacing.x;
    this.cellHeight = sprite.height + spacing.y;
    this.sprite = sprite;
    this.draw = function(menuX, menuY, sheetX, sheetY) {
        const drawPos = this.origin.add(
            menuX * this.cellWidth, menuY * this.cellHeight);
        this.sprite.draw(drawPos.x, drawPos.y, sheetX, sheetY);
    };
    return this;
}

