function TowerMenu(origin, spacing, sprite, displayNum) {
    this.displayNum = displayNum;
    this.cellDims = new Point(
        sprite.width + spacing.x, sprite.height + spacing.y);
    this.menu = new Menu(origin, this.cellDims, sprite);
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
        this.menu.mouseAction(mousePos, this.drag.bind(this));
    };
    this.drag = function(cell, pos) {
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

function Menu(origin, cellDims, drawable) {
    this.origin = origin;
    this.cellDims = cellDims;
    this.drawable = drawable;
    this.draw = function(menuX, menuY, ...args) {
        const drawPos = this.origin.add(
            menuX * this.cellDims.x, menuY * this.cellDims.y);
        this.drawable.draw(drawPos.x, drawPos.y, ...args);
    };
	this.mouseAction = function(mousePos, func) {
        const diff = mousePos.sub(this.origin.x, this.origin.y);
        const cell = new Point(
            diff.x / this.cellDims.x, diff.y / this.cellDims.y).floor();
        const pos = new Point(
            diff.x % this.cellDims.x, diff.y % this.cellDims.y);
        func(cell, pos);
    };
    return this;
}

