var io;
var gameIO;
const GAME_NAMESPACE = "/game";
const MAXIMUM_PLAYERS_ALLOWED = 2;

const SocketEvents = {
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect'
}

const roomNameList = [];
const roomObjects = {};

module.exports = function (socketio) {
  io = socketio;
  attach(socketio);
}

function isTheRoomFull(roomno, maximumPlayersAllowedInOneRoom) {
  return io.nsps[GAME_NAMESPACE].adapter.rooms[getRoomName(roomno)]
      && io.nsps[GAME_NAMESPACE].adapter.rooms[getRoomName(roomno)].length
      > (maximumPlayersAllowedInOneRoom - 1);
}

function getNumberOfPlayersInRoom(roomPin) {
  return io.nsps[GAME_NAMESPACE].adapter.rooms[getRoomName(roomPin)] ?
      io.nsps[GAME_NAMESPACE].adapter.rooms[getRoomName(roomPin)].length : 0
}

function attach() {
  let roomno = 1;
  gameIO = io.of(GAME_NAMESPACE);

  gameIO.on(SocketEvents.CONNECTION, function (socket) {
    /* console.log('A user connected');
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
     });*/

    console.log("whats up");
    Object.keys(ServerHandledEvents).forEach((value) => {
      socket.on(value, (data) => ServerHandledEvents[value](socket, data));
    });

        socket.on(SocketEvents.DISCONNECT, function () {
            console.log('A user disconnected', socket.id);
            Object.values(roomObjects).filter(roomObject => {
                let i = 0;
                for (; i < roomObject.players.length; i++) {
                    let item = roomObject.players[i];
                    let players = roomObject.players;
                    if (item && item.socketID == socket.id) {
                        roomObject.players = [
                            ...players.slice(0, i),
                            ...players.slice(i + 1)
                        ]
                        break;
                    }
                }
            })
        });

    });
}

function getRoomName(roomNo) {
    return "room-" + roomNo;
}

function emitToGameRoom(clientHandledEvent, message, roomID) {
    console.log(roomID);
    console.log(roomNameList)
    console.log(roomID && roomNameList.includes(getRoomName(roomID)));
    if (roomID && roomNameList.includes(getRoomName(roomID))) {
        gameIO.to(getRoomName(roomID)).emit(clientHandledEvent, message);
    } else {
        gameIO.emit(clientHandledEvent, message);
    }
  console.log(roomID);
  console.log(roomNameList)
  console.log(roomID && roomNameList.includes(getRoomName(roomID)));
  if (roomID && roomNameList.includes(getRoomName(roomID))) {
    gameIO.to(getRoomName(roomID)).emit(clientHandledEvent, message);
  } else {
    gameIO.emit(clientHandledEvent, message);
  }
}

function createRoomAndAddSocket(socket, data) {
    let roomName = getRoomName(data.roomPin);
    let roomObject = {
        "name": roomName,
        "players": [
            {
                "socketID": socket.id,
                "name": data.name,
                "team": data.team
            }
        ]
    };
    roomNameList.push(roomName);
    socket.join(roomName);
    roomObjects[roomName] = roomObject;
    console.log("room object");
    console.log(roomObjects);
}



function joinRoomIfExists(socket, data) {
    let roomName = getRoomName(data.roomPin);
    console.log("join room if exists "+ roomName);
    console.log(roomNameList)
    if(roomNameList.includes(roomName)){
        socket.join(roomName);
        getRoomObject(roomName).players.push({
            "socketID": socket.id,
            "name": data.name,
            "team": data.team
        });
        console.log(data.name + " joined room "+ roomName);
        console.log(getRoomObject(roomName).players);
    }else{
        console.log("Invalid Pin !!!!! do something about it ################");
    }
}

function getRoomObject(roomName) {
    return roomObjects[roomName];
}

/*  ---------------------------------------------------------------
                        SERVER Handled Events
    ---------------------------------------------------------------
 */

const ServerHandledEvents = {
  START: startGame,
  PLAYER_DIED: playerDied,
  CREATE_ROOM: createRoom,
  JOIN_ROOM: joinRoom,
  START_GAME: startGame,
  UPDATE_GAME_STATE: updateGameState
}

function startGame(socket, roomPin) {
    console.log("start received: ", roomPin);
    emitToGameRoom(ClientHandledEvents.START_GAME, "start game", roomPin)

}


function playerDied(socket, data) {
  console.log("yeah", data);
  emitToGameRoom(ClientHandledEvents.ROOM_JOINED, {"ndansj": "asf"}, 1);
}

function createRoom(socket, data) {
    console.log("inside create room " + data.roomPin);
    createRoomAndAddSocket(socket, data);
    emitToGameRoom(ClientHandledEvents.ROOM_CREATED,
        {
            "message": "You have created room " + data.roomPin,
            numberOfPlayers: 1,
            roomPin: data.roomPin,
            name: data.name,
            team: data.team
        }
        , data.roomPin)
}


function joinRoom(socket, data) {
    console.log("inside join room " + data.roomPin);
    joinRoomIfExists(socket, data);
    console.log("player joined "+ getNumberOfPlayersInRoom(data.roomPin));
    emitToGameRoom(ClientHandledEvents.ROOM_JOINED, {
        roomPin: data.roomPin,
        numberOfPlayers: getNumberOfPlayersInRoom(data.roomPin),
        name: data.name,
        team: data.team
    }, data.roomPin)
}

function updateGameState(socket, data) {
  emitToGameRoom(ClientHandledEvents.UPDATE_CLIENT_GAME_STATE, {
    id: socket.id,
    ...data
  })

/*  ---------------------------------------------------------------
                        CLIENT Handled Events
                        need to call
                        emitToGameRoom(clientHandledEvent, message, [roomNumber])
                        to emit the event, and should always
    ---------------------------------------------------------------
 */
const ClientHandledEvents = {
    ROOM_JOINED: "ROOM_JOINED",
    ROOM_CREATED: "ROOM_CREATED",
    START_GAME: "START_GAME",
  UPDATE_CLIENT_GAME_STATE: "UPDATE_CLIENT_GAME_STATE"
}

