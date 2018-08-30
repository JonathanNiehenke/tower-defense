function SpriteObj(context, imgSheet, imgRows, imgCols) {
    this.context = context;
    this.img = loadImage(imgSheet);
    this.width = this.img.width / imgCols;
    this.height = this.img.height / imgRows;
    this.draw = function(col, row, x, y) {
        col = (col * this.width) % this.img.width;
        row = row * this.height;
        this.context.drawImage(this.img,
            col, row, this.width, this.height,  // Source
            x, y, this.width, this.height);  // Destination
    };
    return this;
}

function IsoTangle(context) {
    this.context = context;
    this.draw = function(x, y, length, width, stroke, fill) {
        this.path(x, y, length, width / 2);
        context.strokeStyle = stroke;
        context.fillStyle = fill;
        context.stroke();
        context.fill();
    };
    this.path = function(x, y, length, width) {
        this.context.beginPath();
        this.context.moveTo(x, y);
        this.context.lineTo(x + length, y + width);
        this.context.lineTo(x, y + length);
        this.context.lineTo(x - length, y + width);
        this.context.closePath();
    };
    return this;
}

