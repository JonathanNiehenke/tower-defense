function TowerMenu(sprite, origin, spacing, displayNum) {
    this.menu = new Menu(sprite, origin, spacing);
    this.displayNum = displayNum;
    this.draw = function() {
        for (let i = 0; i < this.displayNum; ++i)
            this.menu.draw(0, i*3, i, 0);
    };
    return this;
}

function Menu(sprite, origin, spacing) {
    this.sprite = sprite;
    this.origin = origin;
    const cellWidth = sprite.width + spacing.x;
    const cellHeight = sprite.height + spacing.y;
    this.draw = function(sheetX, sheetY, menuX, menuY) {
        let drawPoint = this.origin.add(menuX * cellWidth, menuY * cellHeight);
        this.sprite.draw(sheetX, sheetY, drawPoint.x, drawPoint.y);
    };
    return this;
}

