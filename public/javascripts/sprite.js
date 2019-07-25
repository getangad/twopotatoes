DIRECTIONS = {
  TOP: 1,
  BOTTOM: 2,
  LEFT: 3,
  RIGHT: 4
}

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
    return this.y - this.width / 2;
  }
  return this.y;
}

//TODO for server transfer
Sprite.prototype.toJson = function () {

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

Sprite.prototype.draw = function (ctx) {
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