SHAPE_TYPE = {
  CIRCLE: 1,
  RECTANGLE: 2
}

var Sprite = function (x, y, width, height, velocity,
    shape = SHAPE_TYPE.RECTANGLE) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.velocity = velocity;
  this.direction = 0;
  this.shape = shape;
  this.display = true;
}

Sprite.prototype.right = function () {
  if (this.shape == SHAPE_TYPE.CIRCLE) {
    return this.x + this.width / 2;
  }
  return this.x + this.width;
}

Sprite.prototype.top = function () {
  if (this.shape == SHAPE_TYPE.CIRCLE) {
    return this.y;
  }
  return this.y;
}

//TODO for server transfer
Sprite.prototype.toJSON = function () {
    return {
      x:this.x,
      y:this.y,
      width:this.width,
      height:this.height,
      velocity:this.velocity,
      direction:this.direction,
      shape: this.shape,
      display: this.display
    }
}

Sprite.prototype.bottom = function () {
  if (this.shape == SHAPE_TYPE.CIRCLE) {
    return this.y + this.width / 2;
  }
  return this.y + this.height;
}

Sprite.prototype.left = function () {
  if (this.shape == SHAPE_TYPE.CIRCLE) {
    return this.x - this.width / 2;
  }
  return this.x;
}

Sprite.prototype.centerX = function () {
  if (this.shape == SHAPE_TYPE.CIRCLE) {
    return this.x;
  }
  return this.x + this.width / 2;
}

Sprite.prototype.centerY = function () {
  if (this.shape == SHAPE_TYPE.CIRCLE) {
    return this.y;
  }
  return this.y + this.height / 2;
}

Sprite.prototype.draw = function (ctx) {
  if (!this.display) {
    return;
  }
  ctx.beginPath();
  ctx.rect(this.x, this.y, this.width, this.height);
  ctx.fillStyle = "#333";
  ctx.fill();
  ctx.closePath();
}

Sprite.prototype.isCollision = function (anotherSprite) {
  if (this.right() >= anotherSprite.left()
      && this.bottom() >= anotherSprite.top()
      && this.top() <= anotherSprite.bottom()
      && this.left() <= anotherSprite.right()) {

    return true;
  }
  return false;
}

function drawImageRot(img, x, y, width, height, deg) {
  var rad = deg * Math.PI / 180;
  this.translate(x + width / 2, y + height / 2);
  this.rotate(rad);
  this.drawImage(img, width / -2, height / -2, width, height);
  this.rotate(rad * (-1));
  this.translate(-(x + width / 2), -(y + height / 2));
}