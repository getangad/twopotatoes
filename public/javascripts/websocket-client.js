const ServerHandledEvents = {
  START: "START",
  PLAYER_DIED: "PLAYER_DIED"
}

const ClientHandledEvents = {
  ROOM_JOINED: "ROOM_JOINED"
}

var socket = io.connect("/game");

socket.on(ClientHandledEvents.ROOM_JOINED, function (data) {
  console.log("Room Joined: " + data);
  socket.emit(ServerHandledEvents.START, 'ohh yeah');
});

// so that can be utilized by game.js
var WebsocketClient = {

};