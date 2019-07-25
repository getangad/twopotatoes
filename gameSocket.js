var io;
var gameIO;
const GAME_NAMESPACE = "/game";
const MAXIMUM_PLAYERS_ALLOWED = 2;

const SocketEvents = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect'
}

module.exports = function (socketio) {
  io = socketio;
  attach(socketio);
}

function isTheRoomFull(roomno, maximumPlayersAllowedInOneRoom) {
  return io.nsps[GAME_NAMESPACE].adapter.rooms[getRoomName(roomno)]
      && io.nsps[GAME_NAMESPACE].adapter.rooms[getRoomName(roomno)].length
      > (maximumPlayersAllowedInOneRoom - 1);
}

function attach() {
  var roomno = 1;
  gameIO = io.of(GAME_NAMESPACE);
  gameIO.on(SocketEvents.CONNECTION, function (socket) {
    console.log('A user connected');
    if (isTheRoomFull(roomno, MAXIMUM_PLAYERS_ALLOWED)) {
      roomno++;
    }
    socket.join(getRoomName(roomno));

    emitToGameRoom(ClientHandledEvents.ROOM_JOINED,
        "You are in room no. " + roomno, roomno)

    Object.keys(ServerHandledEvents).forEach((value) => {
      socket.on(value, (data) => ServerHandledEvents[value](socket, data));
    });

    socket.on(SocketEvents.DISCONNECT, function () {
      console.log('A user disconnected', socket.rooms);
    });
  });
}

function getRoomName(roomNo) {
  return "room-" + roomNo;
}

function emitToGameRoom(clientHandledEvent, message, roomNumber) {
  if (roomNumber) {
    gameIO.to(getRoomName(roomNumber)).emit(clientHandledEvent, message);
  } else {

    gameIO.emit(clientHandledEvent, message);
  }
}

/*  ---------------------------------------------------------------
                        SERVER Handled Events
    ---------------------------------------------------------------
 */

const ServerHandledEvents = {
  START: startGame,
  PLAYER_DIED: playerDied
}

function startGame(socket, data) {
  console.log("start received:", data);
}


function playerDied(socket, data) {
  console.log("yeah", data);

  emitToGameRoom(ClientHandledEvents.ROOM_JOINED, {"ndansj":"asf"}, 1);
}

/*  ---------------------------------------------------------------
                        CLIENT Handled Events
                        need to call
                        emitToGameRoom(clientHandledEvent, message, [roomNumber])
                        to emit the event, and should always
    ---------------------------------------------------------------
 */
const ClientHandledEvents = {
  ROOM_JOINED: "ROOM_JOINED"
}

