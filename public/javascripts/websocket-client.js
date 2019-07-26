const ServerHandledEvents = {
  START: "START",
  PLAYER_DIED: "PLAYER_DIED",
  CREATE_ROOM: "CREATE_ROOM",
  JOIN_ROOM: "JOIN_ROOM",
  START_GAME: "START_GAME"
}

const ClientHandledEvents = {
  ROOM_JOINED: "ROOM_JOINED",
  ROOM_CREATED: "ROOM_CREATED",
  START_GAME: "START_GAME"
}

var player = {
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
    socket.emit(ServerHandledEvents.START_GAME, this.player.roomPin);
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
    if(!player.role) {
        console.log("Room Joined: ");
        console.log(data);
        showTemplate($('#joinRoomWaitingTemplate').html());
        player.roomPin = data.roomPin;
        player.role = "player";
        document.getElementById('playerDivMsg').innerHTML = '' +
            '<p> welcome to team - ' + data.team + ' ' + data.name + '</p>';
    }
    document.getElementById('playerCount').innerHTML = '<p><strong> number of players : ' + data.numberOfPlayers + '</strong></p>';
});

socket.on(ClientHandledEvents.ROOM_CREATED, function (data) {
    console.log("Room created: " + data.message);
    showTemplate($('#createRoomWaitingTemplate').html());
    player.roomPin = data.roomPin;
    player.role = "host";
    /*player.name = "";
    player.numberOfPlayers = data.numberOfPlayers;
    player.team = data.team;*/
    document.getElementById('roomID').innerHTML += '<p><strong> PIN : ' + data.roomPin +'</strong></p>';
    document.getElementById('playerCount').innerHTML = '<p><strong> number of players : ' + data.numberOfPlayers +'</strong></p>';
    document.getElementById('playerDivMsg').innerHTML = '' +
        '<p> welcome to team - ' + data.team + ' ' + data.name + '</p>';
});


socket.on(ClientHandledEvents.START_GAME, function(data){
    console.log(data);
    showTemplate($('#canvasTemplate').html());
});