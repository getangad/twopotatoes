keysPressed = {
  leftPressed: false,
  rightPressed: false,
  upPressed: false,
  downPressed: false
}

var listeners = [];
var addGameKeyboardListener = function (func) {
  listeners.push(func);
}

function keyDownHandler(e) {
  keysPressed.rightPressed = false;
  keysPressed.upPressed = false;
  keysPressed.leftPressed = false;
  keysPressed.downPressed = false;

  if (e.key == "ArrowRight") {
    keysPressed.rightPressed = true;
  } else if (e.key == "ArrowUp") {
    keysPressed.upPressed = true;
  } else if (e.key == "ArrowLeft") {
    keysPressed.leftPressed = true;
  } else if (e.key == "ArrowDown") {
    keysPressed.downPressed = true;
  } else {
    return;
  }
  listeners.forEach(value => value(keysPressed));
}

document.addEventListener("keydown", keyDownHandler, false);