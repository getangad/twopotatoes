canvas = document.getElementById('canvas');
ctx = canvas.getContext('2d');
ctx.fillStyle = '#2522ff';
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.drawImageRot = drawImageRot; //updated context to support rotation of images
var explosionImage = document.getElementById("explosion");
var game = {
  over: false,
}

function createPlayer(team) {
  var player = new Sprite(0, 50 + Math.floor(Math.random() * 300), 30, 30,
      CONFIG.DEFAULT_VELOCITY,
      SHAPE_TYPE.RECTANGLE);
  player.id = Math.random() * 100;
  player.health = 2;
  return player;
}

/**
 * SPRITES
 * @type {Sprite}
 */

// Main Player
var player = createPlayer(playerInfo.team);

player.draw = function (ctx) {
  if (!this.display) {
    return;
  }
  var image = (this.team == "teamA" ? "playerA" : "playerB") + (this.health == 1
      ? "_hurt" : "");
  var img = document.getElementById(image);
  ctx.beginPath();
  ctx.fillStyle = "#0095DD";

  if (this.health > 0) {
    ctx.border = "#333";
    ctx.drawImageRot(img, this.left() - 5, this.top() - 5, this.width + 10,
        this.height + 10,
        this.direction);
  } else {
    this.frameIndex = this.frameIndex || 0;
    if (this.frameIndex == 9) {
      if (this.display) {
        this.display = false;
      }
      return;
    }
    this.frameIndex++;
    ctx.drawImage(
        explosionImage,
        this.frameIndex * 100,
        0,
        100,
        100,
        this.x,
        this.y,
        this.width,
        this.height);
  }

  ctx.closePath();
}
player.toJSON = function () {
  console.log(this);
  return {
    x: this.x,
    y: this.y,
    width: this.width,
    height: this.height,
    health: this.health,
    velocity: this.velocity,
    direction: this.direction,
    shape: this.shape,
    display: this.display,
    name: this.name,
    team: this.team,
    roomPin: this.roomPin,
    id: this.id
  };
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

function fireBullet(byPlayer) {
  var bullet = new Sprite(byPlayer.centerX(), byPlayer.centerY(), 10, 10,
      CONFIG.BULLET_VELOCITY);
  bullet.id = byPlayer.id;
  bullet.team = byPlayer.team;
  bullet.direction = byPlayer.direction;
  bullet.draw = function (ctx) {
    /*if (!this.display) {
      return;
    }*/

    if (isCollidingWithAny(this) || isBulletCollidingWithAnyPlayer(this)) {
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
  //areBulletsColliding();
  player.draw(ctx);
  Object.values(allOpponents).forEach(value => value.player.draw(ctx));
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

  if (keyPressed.spacePressed && bullets.filter(
      value => value.id == player.id).length <= CONFIG.MAX_BULLETS_PER_FIRE) {
    fireBullet(player);
    sendGameState(player, true);
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

  sendGameState(player);

  console.log("listener check", keyPressed);
});

function isCollidingWithAny(sprite) {
  return isCollidingListOfSprites(brickWalls, sprite) || isCollidingWithBounds(
      sprite);
}

function isBulletCollidingWithAnyPlayer(bullet) {
  var tempPlayers = Object.values(allOpponents)
  .map(value => value.player);
  tempPlayers.push(player);

  var playersHit = tempPlayers.filter(tplayer => tplayer.team != bullet.team
      && bullet.isCollision(tplayer) && bullet.display);

  playersHit.forEach(value => {
    value.health--;
    //sendGameState(value);
    console.log("hit", value);
  });

  return playersHit.length;
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