function TowerMenu(sprite, origin, spacing, displayNum) {
    this.menu = new Menu(sprite, origin, spacing);
    this.displayNum = displayNum;
    this.dragged = undefined;
    this.draw = function(mousePos) {
        this.drawDrag(mousePos);
        for (let i = 0; i < this.displayNum; ++i)
            this.menu.draw(0, i*3, i, 0);
    };
    this.drawDrag = function(mousePos) {
        if (this.dragged === undefined) return;
        const drawPos = mousePos.sub(this.dragged.pos.x, this.dragged.pos.y);
        sprite.draw(0, this.dragged.value * 3, drawPos.x, drawPos.y);
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

