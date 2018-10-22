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

