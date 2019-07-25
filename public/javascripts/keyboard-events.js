keysPressed = {
  leftPressed: false,
  rightPressed: false,
  upPressed: false,
  downPressed: false,
  spacePressed: false,
}

var listeners = [];
var addGameKeyboardListener = function (func) {
  listeners.push(func);
}

function keyDownHandler(e, value) {
  if (e.keyCode === 32) {
    keysPressed.spacePressed = value;
  }
  if (e.key == "ArrowRight") {
    console.log("right", value);
    keysPressed.rightPressed = value;
  }
  else if (e.key == "ArrowUp") {
    keysPressed.upPressed = value;
  }
  else if (e.key == "ArrowLeft") {
    keysPressed.leftPressed = value;
  }
  else if (e.key == "ArrowDown") {
    keysPressed.downPressed = value;
  }
  if (value) {
    listeners.forEach(value => value(keysPressed));
  }
}

document.addEventListener("keydown", (e) => keyDownHandler(e, true), false);
document.addEventListener("keyup", (e) => keyDownHandler(e, false), false);