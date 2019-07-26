var io;
var gameIO;
const GAME_NAMESPACE = "/game";
const MAXIMUM_PLAYERS_ALLOWED = 2;
const GAME_NOT_STARTED = 0;
const GAME_STARTED = 1;

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
        console.log("whats up");
        Object.keys(ServerHandledEvents).forEach((value) => {
            socket.on(value, (data) => ServerHandledEvents[value](socket, data));
        });

        socket.on(SocketEvents.DISCONNECT, function () {
            Object.values(roomObjects).filter(roomObject => {
                console.log(roomObject);
                let i = 0;
                for (; i < roomObject.players.length; i++) {
                    let item = roomObject.players[i];
                    let players = roomObject.players;
                    if (item && item.socketID == socket.id) {
                        emitToGameRoom(ClientHandledEvents.CLIENT_DISCONNECTED, {
                            socketID: socket.id,
                            roomPin: item.roomPin
                        }, item.roomPin);

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
    if (roomID && roomObjects[getRoomName(roomID)]) {
        gameIO.to(getRoomName(roomID)).emit(clientHandledEvent, message);
    } else {
        gameIO.emit(clientHandledEvent, message);
    }
}

function createRoomAndAddSocket(socket, data) {
    let roomName = getRoomName(data.roomPin);
    let roomObject = {
        "name": roomName,
        "status": GAME_NOT_STARTED,
        "players": [
            {
                "socketID": socket.id,
                "name": data.name,
                "team": data.team,
                "roomPin": data.roomPin
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
    console.log("join room if exists " + roomName);
    if (roomObjects[roomName] && roomObjects[roomName].status != GAME_STARTED) {
        socket.join(roomName);
        getRoomObject(roomName).players.push({
            "socketID": socket.id,
            "name": data.name,
            "team": data.team,
            "roomPin": data.roomPin
        });
        console.log(data.name + " joined room " + roomName);
        console.log(getRoomObject(roomName).players);
        return true;
    }
    console.log("Invalid Pin !!!!! do something about it ################");
    return false;
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

function startGame(socket, data) {
    console.log("start received: ", data.roomPin);
    roomObjects[getRoomName(data.roomPin)].status = GAME_STARTED;
    emitToGameRoom(ClientHandledEvents.START_GAME, data, data.roomPin)
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
    if (joinRoomIfExists(socket, data)) {
        console.log("player joined " + getNumberOfPlayersInRoom(data.roomPin));
        emitToGameRoom(ClientHandledEvents.ROOM_JOINED, {
            roomPin: data.roomPin,
            numberOfPlayers: getNumberOfPlayersInRoom(data.roomPin),
            name: data.name,
            team: data.team
        }, data.roomPin)
    }
    console.log("room doesn't exist");
}

function updateGameState(socket, data) {
    //console.log("inside update game state "+ data.player.roomPin)
    emitToGameRoom(ClientHandledEvents.UPDATE_CLIENT_GAME_STATE, {
        id: socket.id,
        ...data
    }, data.player.roomPin);
}

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
    UPDATE_CLIENT_GAME_STATE: "UPDATE_CLIENT_GAME_STATE",
    CLIENT_DISCONNECTED: "CLIENT_DISCONNECTED"
}


