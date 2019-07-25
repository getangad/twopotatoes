canvas = document.getElementById('canvas');
ctx = canvas.getContext('2d');
ctx.fillStyle = '#2522ff';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.drawImageRot = drawImageRot; //updated context to support rotation of images

var game = {
  over: false,
}
/**
 * SPRITES
 * @type {Sprite}
 */

// Main Player
var player = new Sprite(0, 100, 60, 60, CONFIG.DEFAULT_VELOCITY,
    SHAPE_TYPE.RECTANGLE);

player.id = 1;
player.draw = function (ctx) {
  if (!this.display) {
    return;
  }
  var img = document.getElementById("player");
  ctx.beginPath();
  ctx.fillStyle = "#0095DD";

  ctx.border = "#333";
  ctx.drawImageRot(img, this.left(), this.top(), this.width, this.height,
      player.direction);
  ctx.closePath();
}

function getBrickWalls() {
  var bricks = [
    new Sprite(80, 60, 30, canvas.height - 130),
    new Sprite(canvas.width - 80 - 30, 60, 30, canvas.height - 130),
    //five blocks
    new Sprite(250, 100, 100, 100),
    new Sprite(canvas.width - 250 - 100, 100, 100, 100),
    new Sprite(canvas.width / 2 - 50, canvas.height / 2 - 50, 100, 100),
    new Sprite(250, canvas.height - 200, 100, 100),
    new Sprite(canvas.width - 250 - 100, canvas.height - 200, 100, 100)];

  //bricks.draw
  return bricks;
}

// Brick Wall
var brickWalls = getBrickWalls();
var bullets = [];

function fireBullet(player) {
  var bullet = new Sprite(player.centerX(), player.centerY(), 10, 10,
      CONFIG.BULLET_VELOCITY,
      SHAPE_TYPE.CIRCLE);
  bullet.direction = player.direction;
  var explosionImage = document.getElementById("explosion");
  bullet.draw = function (ctx) {
    /*if (!this.display) {
      return;
    }*/

    if (isCollidingWithAny(this)) {
      this.display = false;
    }
    ctx.beginPath();

    if (this.display) {
      ctx.arc(this.x, this.y, this.width / 2, 0, 2 * Math.PI);
      this.x += this.velocity * Math.cos(this.direction * Math.PI / 180);
      this.y += this.velocity * Math.sin(this.direction * Math.PI / 180);
    } else {
      this.frameIndex = this.frameIndex || 0;
      if (this.frameIndex == 9) {
        bullets = bullets.filter(value => value !== bullet);
        return;
      }
      this.frameIndex++;
      ctx.drawImage(
          explosionImage,
          this.frameIndex * 100,
          0,
          100,
          100,
          this.x - 10,
          this.y - 10,
          30,
          30);

    }
    ctx.fillStyle = "#990000";
    ctx.fill();
    ctx.closePath();
  }
  bullets.push(bullet);
}

/**
 * Draw Game Logic
 * @param timestamp
 */

function drawGame(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.draw(ctx);
  brickWalls.forEach(value => value.draw(ctx));
  bullets.forEach(value => value.draw(ctx));
  if (game.over) {
    gameOver();
  }
}

function gameOver() {
  ctx.fillStyle = "#000";
  ctx.font = "40px Arial";
  ctx.fillText(" Game Over", 10, 170);
}

function gameLoop(timestamp) {
  drawGame(timestamp);
  if (!game.over) {
    window.requestAnimationFrame(gameLoop);
  }
}

/*
    KEYBOARD EVENT LISTENER
 */

function getClonedPlayer() {
  var tempPlayer = Object.assign({}, player);
  tempPlayer.__proto__ = Sprite.prototype;
  return tempPlayer;
}

addGameKeyboardListener(function (keyPressed) {

  if (keyPressed.spacePressed) {
    fireBullet(player);
  }

  if (keyPressed.leftPressed) {
    var tempPlayer = getClonedPlayer();
    tempPlayer.x -= tempPlayer.velocity;
    if (!isCollidingWithAny(tempPlayer)) {
      player.x = tempPlayer.x;
    }
    player.direction = 180;

  } else if (keyPressed.rightPressed) {
    var tempPlayer = getClonedPlayer();
    tempPlayer.x += tempPlayer.velocity;
    if (!isCollidingWithAny(tempPlayer)) {
      player.x += tempPlayer.velocity;
    }
    player.direction = 0;
  } else if (keyPressed.upPressed) {
    var tempPlayer = getClonedPlayer();
    tempPlayer.y -= tempPlayer.velocity;
    if (!isCollidingWithAny(tempPlayer)) {
      player.y = tempPlayer.y;
    }
    player.direction = 270;
  } else if (keyPressed.downPressed) {
    var tempPlayer = getClonedPlayer();
    tempPlayer.y += tempPlayer.velocity;
    if (!isCollidingWithAny(tempPlayer)) {
      player.y = tempPlayer.y;
    }
    player.direction = 90;
  }

  console.log("listener check", keyPressed);
})

function isCollidingWithAny(sprite) {
  return isCollidingListOfSprites(brickWalls, sprite) || isCollidingWithBounds(
      sprite);
}

function isCollidingListOfSprites(sprite, player) {
  return sprite.filter(value => player.isCollision(value)).length;
}

function isCollidingWithBounds(sprite) {
  return (sprite.left() < 0)
      || (sprite.right() > canvas.width)
      || (sprite.top() < 0)
      || (sprite.bottom() > canvas.height)
}

window.requestAnimationFrame(gameLoop);