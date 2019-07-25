canvas = document.getElementById('canvas');
ctx = canvas.getContext('2d');
ctx.fillStyle = '#2522ff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

var game = {
  over: false,
}

var player = new Sprite(100, 100, 80, 80, CONFIG.DEFAULT_VELOCITY,
    SHAPE_TYPE.RECTANGLE);


function drawGame(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.draw(ctx);
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

addGameKeyboardListener(function (keyPressed) {
  if (keyPressed.leftPressed) {
    player.x -= player.velocity;
  } else if (keyPressed.rightPressed) {
    player.x += player.velocity;
  } else if (keyPressed.upPressed) {
    player.y -= player.velocity;
  } else if (keyPressed.downPressed) {
    player.y += player.velocity;
  }
  console.log("listener check", keyPressed);
})
window.requestAnimationFrame(gameLoop);