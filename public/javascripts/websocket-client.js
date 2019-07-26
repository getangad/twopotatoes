const ServerHandledEvents = {
  START: "START",
  PLAYER_DIED: "PLAYER_DIED",
  CREATE_ROOM: "CREATE_ROOM",
  JOIN_ROOM: "JOIN_ROOM",
  UPDATE_GAME_STATE: "UPDATE_GAME_STATE"
}

const ClientHandledEvents = {
  ROOM_JOINED: "ROOM_JOINED",
  ROOM_CREATED: "ROOM_CREATED",
  UPDATE_CLIENT_GAME_STATE: "UPDATE_CLIENT_GAME_STATE"
}
/*

var createRoomBtn = document.getElementById('createRoom'),
    roomID = document.getElementById('roomID'),
    playerCount = document.getElementById('playerCount'),
    joinRoomBtn = document.getElementById('joinRoom'),

    hostNameInput = document.getElementById('hostName'),

    roomPinInput = document.getElementById('roomPin'),
    playerNameInput = document.getElementById('playerName');

var socket = io.connect("/game");

// so that can be utilized by game.js
var WebsocketClient = {};

//create room
createRoomBtn.addEventListener('click', function () {
  console.log("started to create room");
  let roomPin = getRoomPin();
  socket.emit(ServerHandledEvents.CREATE_ROOM, {
    "roomPin": roomPin,
    "name": hostNameInput.value,
    "team": document.getElementById('hostTeam').value
  });
  roomID.innerHTML += '<p><strong> PIN : ' + roomPin + '</strong></p>';
});

//join room
joinRoomBtn.addEventListener('click', function () {
  console.log("started to join room");
  socket.emit(ServerHandledEvents.JOIN_ROOM, {
    "roomPin": roomPinInput.value,
    "name": playerNameInput.value,
    "team": document.getElementById('playerTeam').value
  });
});

function getRoomPin() {
  return Math.floor(Math.random() * 90000) + 10000;
}

socket.on(ClientHandledEvents.ROOM_JOINED, function (data) {
  console.log("Room Joined: ");
  console.log(data);
  console.log("players info: " + data.players);
  playerCount.innerHTML = '<p><strong> number of players : '
      + data.numberOfPlayers + '</strong></p>';
});

socket.on(ClientHandledEvents.ROOM_CREATED, function (data) {
  console.log("Room created: " + data.message);
  playerCount.innerHTML = '<p><strong> number of players : '
      + data.numberOfPlayers + '</strong></p>';
});*/

var socket = io.connect("/game");
var id = null;
// so that can be utilized by game.js
var WebsocketClient = {};

//create room
function createRoom() {
  console.log("started to create room");
  //let roomPin = getRoomPin();
  socket.emit(ServerHandledEvents.CREATE_ROOM, {
    "roomPin": 1,
    "name": "p" + (Math.random() * 100).toFixed(0),
    "team": "A"
  });
}

//join room
function joinRoom() {
  console.log("started to join room");
  socket.emit(ServerHandledEvents.JOIN_ROOM, {
    "roomPin": 1,
    "name": "p" + (Math.random() * 100).toFixed(0),
    "team": "A"
  });
};

socket.on(ClientHandledEvents.ROOM_JOINED, function (data) {
  console.log("Room Joined: ");
  console.log(data);
  id = data.id;

  console.log("players info: " + data.players);
});

socket.on(ClientHandledEvents.ROOM_CREATED, function (data) {
  console.log("Room created: " + data.message);
});

var allOpponents = {};

socket.on(ClientHandledEvents.UPDATE_CLIENT_GAME_STATE, function (data) {
  data.player.__proto__ = Sprite.prototype;
  data.player.prototype = Sprite.prototype;
  data.player.draw = player.draw;
  allOpponents[data.id] = {player: data.player, id: data.id};
  if (data.isBulletFired) {
    fireBullet(data.player);
  }
  console.log("all Opponents", allOpponents);
});

function sendGameState(player, isBulletFired = false) {
  socket.emit(ServerHandledEvents.UPDATE_GAME_STATE, {
    player: player.toJSON(),
    isBulletFired: isBulletFired
  });
}

createRoom();
joinRoom();