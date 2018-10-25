function loadImage(Name) {
    let img = new Image();
    img.src = Name;
    return img;
}

function Sprite(context, imgSheet, imgRows, imgCols) {
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

function Rectangle(context) {
    this.context = context;
    this.draw = function(x, y, width, height, stroke, fill) {
        this.path(x, y, width, height);
        context.strokeStyle = stroke;
        context.fillStyle = fill;
        context.stroke();
        context.fill();
    };
    this.path = function(x, y, width, height) {
        this.context.beginPath();
        this.context.moveTo(x, y);
        this.context.lineTo(x + width, y);
        this.context.lineTo(x + width, y + height);
        this.context.lineTo(x, y + height);
        this.context.closePath();
    };
    return this;
}

function Circle(context) {
    this.context = context;
    this.draw = function(x, y, radius, _, stroke, fill) {
        this.path(x, y, radius);
        context.strokeStyle = stroke;
        context.fillStyle = fill;
        context.stroke();
        context.fill();
    };
    this.path = function(x, y, radius) {
        this.context.beginPath();
        context.arc(x, y, radius, 0, 2 * Math.PI);
        context.closePath();
    };
    return this;
}

function HealthBar(context) {
    this.context = context;
    this.draw = function(x, y, maxLength, width, stroke, percent) {
        const radius = width / 2;
        this.path(x + radius, y + radius, maxLength * percent - width, radius);
        context.strokeStyle = stroke;
        context.fillStyle = this.fill(x, maxLength);
        context.stroke();
        context.fill();
    };
    this.path = function(x, y, length, radius) {
        const arcTop = 1.5 * Math.PI, arcBot = 0.5 * Math.PI;
        context.beginPath();
        context.arc(x + length, y, radius, arcTop, arcBot);
        context.arc(x, y, radius, arcBot, arcTop);
        context.closePath();
    };
    this.fill = function(x, maxLength) {
        let gradient = context.createLinearGradient(
            x, 0, x + maxLength, 0);
        gradient.addColorStop(0,"red");
        gradient.addColorStop(0.5,"yellow");
        gradient.addColorStop(1,"green");
        return gradient;
    };
    return this;
}

function Orb(context) {
    this.context = context;
    this.draw = function(x, y, radius, blur, outerColor, innerColor) {
        this.path(x, y, radius);
        context.fillStyle = this.fill(x, y, radius, innerColor, outerColor);
        context.fill();
    };
    this.path = function(x, y, radius) {
        this.context.beginPath();
        this.context.arc(x, y, radius, 0, 2 * Math.PI);
    };
    this.fill = function(x, y, radius, innerColor, outerColor) {
        let gradient = context.createRadialGradient(
            x, y, radius/2, x, y, radius);
        gradient.addColorStop(0, innerColor);
        gradient.addColorStop(1, outerColor);
        return gradient;
    };
    return this;
}

