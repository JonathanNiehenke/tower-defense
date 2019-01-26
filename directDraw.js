function scaleImage(scale, Name) {
    let img = loadImage(Name);
    let canvas = document.createElement('canvas');
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    canvas.getContext('2d').drawImage(img,
        0, 0, img.width, img.height,  // Source
        0, 0, img.width*scale, img.height*scale);
    return canvas;
}

function loadImage(Name) {
    let img = new Image();
    img.src = Name;
    return img;
}

function Sprite(context, imgSheet, imgRows, imgCols, scale=undefined) {
    this.context = context;
    this.img = scale === undefined
        ? loadImage(imgSheet) : scaleImage(scale, imgSheet);
    this.width = this.img.width / imgCols;
    this.height = this.img.height / imgRows;
    this.draw = function(x, y, col, row) {
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

function IsoRectangle(context) {
    this.context = context;
    this.draw = function(x, y, width, height, stroke, fill) {
        this.path(x, y, width, height / 2);
        context.strokeStyle = stroke;
        context.fillStyle = fill;
        context.stroke();
        context.fill();
    };
    this.path = function(x, y, width, height) {
        this.context.beginPath();
        this.context.moveTo(x, y);
        this.context.lineTo(x + width, y + height);
        this.context.lineTo(x, y + width);
        this.context.lineTo(x - width, y + height);
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

function IsoCircle(context) {
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
        this.context.ellipse(x, y, radius * 1.4353, radius * 0.7108, 0, 0, 2 * Math.PI);
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

function RoadOutline(context, stroke) {
    this.context = context;
    this.stroke = stroke;
    this.draw = function(x, y, type, size) {
        this.context.beginPath();
        this.type[type](x, y, size);
        this.context.strokeStyle = stroke;
        this.context.stroke();
    };
   this.vPath = function(x, y, size) {
        this.context.moveTo(x, y);
        this.context.lineTo(x, y + size);
        this.context.moveTo(x + size, y);
        this.context.lineTo(x + size, y + size);
    };
    this.hPath = function(x, y, size) {
        this.context.moveTo(x, y);
        this.context.lineTo(x + size, y);
        this.context.moveTo(x, y + size);
        this.context.lineTo(x + size, y + size);
    };
    this.turn1Path = function(x, y, size) {
        this.context.moveTo(x + size, y + size);
        this.context.arc(x + size, y, size, Math.PI/2, Math.PI);
    };
    this.turn2Path = function(x, y, size) {
        this.context.moveTo(x + size, y);
        this.context.arc(x, y, size, 0, Math.PI/2);
    };
    this.turn3Path = function(x, y, size) {
        this.context.moveTo(x, y + size);
        this.context.arc(
            x + size, y + size, size, Math.PI, Math.PI*1.5);
    };
    this.turn4Path = function(x, y, size) {
        this.context.moveTo(x, y);
        this.context.arc(
            x, y + size, size, Math.PI*1.5, Math.PI*2);
    };
    this.type = [
        (x, y) => {},
        (x, y) => {},
        this.vPath.bind(this),
        this.hPath.bind(this),
        this.turn1Path.bind(this),
        this.turn2Path.bind(this),
        this.turn3Path.bind(this),
        this.turn4Path.bind(this),
    ];
     return this;
}

