let utils = require('../utils/utils');

const gameIdLength = 4;

let game = {};

var rooms = {};

/*
rooms:
{
  <game_id>: {
    players: []
    squares: []
  }
}
*/

function validateGameRoom(gameId) {
  if (!rooms) { return false; }
  if (!rooms[gameId]) { return false; }
  return true;
}

function validatePlayer(gameId, player) {
  if (!rooms[gameId].players) { return false; }
  if (!rooms[gameId].players[player.id]) { return false; }
  return true;
}


game.addPlayer = function(opts) {
  console.log(`Adding player (${opts.player.id})...`);
  let gameId = opts.gameId;
  let player = opts.player;
  let password = opts.password;

  if(!validateGameRoom(gameId)) { return {error: 'room-invalid'}; }

  if (rooms[gameId].password.length > 0) {
    if (password !== rooms[gameId].password) {
      return {error: 'wrong-password'};
    }
  }

  if (Object.keys(rooms[gameId].players).length >= rooms[gameId].maxPlayers) {
    console.log(`Player (${player.id}) cannot join room (${gameId})!`);
    console.log(rooms);
    return {error: 'room-full'};
  }

  rooms[gameId].players[player.id] = {
    id: player.id,
    name: player.name,
    color: player.color,
    ready: false,
    score: 0,
    roundWins: 0,
    roundReset: false
  };

  console.log(`Player (${player.id}) joined room (${gameId})!`);
  console.log(rooms);

  return rooms[gameId].players;
};


game.create = function(opts, password) {
  console.log(`Creating room (${opts.gameId})`);
  let gameId = opts.gameId;
  let maxPlayers = opts.maxPlayers;
  let pointsPerRound = opts.pointsPerRound;

  if(Object.keys(rooms).includes(gameId)) {
    console.log('Room is occupied!');
    return false;
  }

  if (!password) { password = ''; }

  rooms[gameId] = {
    maxPlayers: maxPlayers,
    pointsPerRound: pointsPerRound,
    currRound: -1,
    password: password,
    players: {},
    rounds: []
  };
  
  console.log(`Created room (${gameId})!`);

  return true;
};


game.generateNewId = function(opts) {
  let newGameId = utils.generateId(gameIdLength);
  while (Object.keys(rooms).includes(newGameId)) {
    newGameId = utils.generateId(gameIdLength);
  }

  return newGameId;
};


game.getRooms = function(opts) {
  let self = this;
  let roomList = Object.keys(rooms);
  let currRooms = [];

  roomList.forEach(function(room) {
    let roomData = {
      gameId: room,
      numPlayers: Object.keys(rooms[room].players).length,
      maxPlayers: rooms[room].maxPlayers,
      public: rooms[room].password == '',
    };
    currRooms.push(roomData);
  });

  return {rooms: currRooms};
};


game.getRoomsAndPlayers = function(opts) {
  let currRooms = Object.keys(rooms);
  let numRooms = Object.keys(rooms).length;
  let numPlayers = 0;

  for (let i = 0; i < currRooms.length; i++) {
    numPlayers += rooms[currRooms[i]].players.length;
  }

  return { 
    numRooms: numRooms, 
    numPlayers: numPlayers,
  };
}


game.readyPlayer = function(opts) {
  let gameId = opts.gameId;
  let player = opts.player;

  if(!validateGameRoom(gameId) && !validatePlayer(gameId, player)) { return; }

  rooms[gameId].players[player.id].ready = true;

  let players = rooms[gameId].players;
  let playerKeys = Object.keys(players);
  let playerReadyCount = playerKeys.length;
  let numPlayers = playerKeys.length;
  let gameReady = true;
  for (var i = 0; i < playerKeys.length; i++) {
    if(!players[playerKeys[i]].ready) {
      gameReady = false;
      playerReadyCount--;
    }
  }

  if (gameId !== 'DEV' && numPlayers < 2) { gameReady = false; }

  let readyState = {
    gameReady: gameReady,
    numReady: playerReadyCount,
    numPlayers: numPlayers,
    roundReset: rooms[gameId].roundReset
  };

  return readyState;
};


game.unReadyPlayer = function(opts) {
  let gameId = opts.gameId;
  let player = opts.player;

  if (!validateGameRoom(gameId) && !validatePlayer(gameId, player)) { return; }
  
  rooms[gameId].players[player.id].ready = false;
  
  let players = rooms[gameId].players;
  let playerKeys = Object.keys(players);
  let playerReadyCount = playerKeys.length;
  let numPlayers = playerKeys.length;
  let gameReady = true;
  for (var i = 0; i < playerKeys.length; i++) {
    if(!players[playerKeys[i]].ready) {
      gameReady = false;
      playerReadyCount--;
    }
  }

  if (numPlayers < 2) { gameReady = false; }

  let readyState = {
    gameReady: gameReady,
    numReady: playerReadyCount,
    numPlayers: numPlayers,
    roundReset: rooms[gameId].roundReset
  };

  return readyState;
};


game.removePlayer = function(opts) {
  let gameId = opts.gameId;
  let player = opts.player;

  if (!validateGameRoom(gameId) && !validatePlayer(gameId, player)) { return; }

  delete rooms[gameId].players[player.id];

  if(rooms[gameId].players.length === 0) {
    delete rooms[gameId];
  }
};


game.score = function(opts) {
  let gameId = opts.gameId;
  let player = opts.player;

  let currRound = rooms[gameId].currRound;

  let playerKeys = Object.keys(rooms[gameId].players);
  playerKeys.forEach(function(id) {
    rooms[gameId].players[id].ready = false;
  });
  
  if (rooms[gameId].rounds[currRound]) {
    return false;
  }

  rooms[gameId].players[player.id].score++;
  rooms[gameId].rounds[currRound] = true;

  let isWinner = false;

  if (rooms[gameId].players[player.id].score >= rooms[gameId].pointsPerRound) {
    rooms[gameId].players[player.id].roundWins++;
    rooms[gameId].roundReset = true;
    isWinner = true;
  }

  let scoreData = {
    player: player,
    gameId: gameId,
    score: rooms[gameId].players[player.id].score,
    winner: isWinner,
  }

  if (isWinner) {
    scoreData['players'] = rooms[gameId].players;
  }

  return scoreData;
};


game.spawnSquare = function(opts) {
  let gameId = opts.gameId;

  let squareData = {
    x: Math.floor(Math.random() * 100) - 50,
    y: Math.floor(Math.random() * 100) - 50,
    roundReset: rooms[gameId].roundReset
  };

  rooms[gameId].rounds.push(false);
  rooms[gameId].currRound++;
  rooms[gameId].roundReset = false;

  return squareData;
};


game.resetRounds = function(opts) {
  let gameId = opts.gameId;

  rooms[gameId].currRound = -1;
  rooms[gameId].rounds = [];

  let playerKeys = Object.keys(rooms[gameId].players);
  playerKeys.forEach(function(id){
    rooms[gameId].players[id].score = 0;
  });
}

module.exports = game;