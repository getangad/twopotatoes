const ServerHandledEvents = {
  START: "START",
  PLAYER_DIED: "PLAYER_DIED",
  CREATE_ROOM: "CREATE_ROOM",
  JOIN_ROOM: "JOIN_ROOM",
  START_GAME: "START_GAME",
  UPDATE_GAME_STATE: "UPDATE_GAME_STATE"
}

const ClientHandledEvents = {
  ROOM_JOINED: "ROOM_JOINED",
  ROOM_CREATED: "ROOM_CREATED",
  START_GAME: "START_GAME",
  UPDATE_CLIENT_GAME_STATE: "UPDATE_CLIENT_GAME_STATE",
  CLIENT_DISCONNECTED: "CLIENT_DISCONNECTED"
}

var playerInfo = {
    roomPin: "",
    socketID: ""
}

var socket = io.connect("/game");


// so that can be utilized by game.js
var WebsocketClient = {

};


//create room
function createRoom (){
  console.log("started to create room");
    console.log( document.querySelector('input[name="host-team"]:checked').value);
  let roomPin = getRoomPin();
    socket.emit(ServerHandledEvents.CREATE_ROOM, {
        "roomPin": roomPin,
        "name": document.getElementById('hostName').value,
        "team": document.querySelector('input[name="host-team"]:checked').value
    });

  //showDivConditionally('createRoomContainer');
};


//join room
function joinRoom(){
    console.log("started to join room "+ document.querySelector('input[name="player-team"]:checked').value+ " "+document.getElementById('playerName').value);
    socket.emit(ServerHandledEvents.JOIN_ROOM, {
        "roomPin": document.getElementById('roomPin').value,
        "name": document.getElementById('playerName').value,
        "team": document.querySelector('input[name="player-team"]:checked').value
    });
};


//start game

function startGame() {
    console.log("stat game ");
    console.log(playerInfo)
    socket.emit(ServerHandledEvents.START_GAME, playerInfo);
}


function getRoomPin(){
  return Math.floor(Math.random()*90000) + 10000;
}


//show hide based on current state

function showCreateRoom() {
    showTemplate($('#createRoomTemplate').html());
};


function showJoinRoom() {
    showTemplate($('#joinRoomTemplate').html());
}

function showTemplate(template) {
    $('#mainContainer').html(template);
}


// client side


socket.on(ClientHandledEvents.ROOM_JOINED, function (data) {
    if(!playerInfo.role) {
        console.log("Room Joined: ");
        console.log(data);
        showTemplate($('#joinRoomWaitingTemplate').html());
        playerInfo.roomPin = data.roomPin;
        playerInfo.role = "player";
        playerInfo.team = data.team;
        playerInfo.name = data.name;
        document.getElementById('playerDivMsg').innerHTML = '' +
            '<p> welcome to team - ' + data.team + ' ' + data.name + '</p>';
    }
    document.getElementById('playerCount').innerHTML = '<p><strong> number of players : ' + data.numberOfPlayers + '</strong></p>';
});

socket.on(ClientHandledEvents.ROOM_CREATED, function (data) {
    console.log("Room created: " + data.message);
    showTemplate($('#createRoomWaitingTemplate').html());
    playerInfo.roomPin = data.roomPin;
    playerInfo.role = "host";
    playerInfo.team = data.team;
    playerInfo.name = data.name;
    document.getElementById('roomID').innerHTML += '<p><strong> PIN : ' + data.roomPin +'</strong></p>';
    document.getElementById('playerCount').innerHTML = '<p><strong> number of players : ' + data.numberOfPlayers +'</strong></p>';
    document.getElementById('playerDivMsg').innerHTML = '' +
        '<p> welcome to team - ' + data.team + ' ' + data.name + '</p>';
});

socket.on(ClientHandledEvents.START_GAME, function (data) {
  console.log(data);
  showTemplate($('#canvasTemplate').html());
  player.roomPin = data.roomPin;
  player.name = playerInfo.name;
  player.team = playerInfo.team;
  console.log(player.toJSON());
  if (player.team == "teamB") {
    player.x = canvas.width - player.width;
    player.direction = 180;
  }
  sendGameState(player)
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

socket.on(ClientHandledEvents.CLIENT_DISCONNECTED, function (data) {

    console.log("client disxonnected client "+ data.socketID + " pin "+ data.roomPin);
    if(allOpponents[data.socketID]) {
        allOpponents[data.socketID].player.display = false;
    }
});



function sendGameState(player, isBulletFired = false) {
  socket.emit(ServerHandledEvents.UPDATE_GAME_STATE, {
    player: player.toJSON(),
    isBulletFired: isBulletFired
  });
}