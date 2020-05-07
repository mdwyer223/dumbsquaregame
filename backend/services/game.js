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
  console.log(`Validating room (${gameId})...`);

  if (!rooms) { return false; }
  if (!rooms[gameId]) { return false; }

  console.log('Room is valid!');
  return true;
}

function validatePlayer(gameId, player) {
  console.log(`Validating player (${player.id}) for game (${gameId})...`);
  if (!rooms[gameId].players) { return false; }
  if (!rooms[gameId].players[player.id]) { return false; }

  console.log('Player is valid!');
  return true;
}

game.addPlayer = function(opts) {
  console.log(`Adding player (${opts.player.id})...`);
  let gameId = opts.gameId;
  let player = opts.player;

  if(!validateGameRoom(gameId)) { return; }

  if (Object.keys(rooms[gameId].players).length >= rooms[gameId].maxPlayers) {
    console.log(`Player (${player.id}) cannot join room (${gameId})!`);
    console.log(rooms);
    return false;
  }

  rooms[gameId].players[player.id] = {
    id: player.id,
    name: player.name,
    color: player.color,
    ready: false,
    score: 0
  };

  console.log(`Player (${player.id}) joined room (${gameId})!`);
  console.log(rooms);

  return rooms[gameId].players;
};


game.create = function(opts) {
  console.log(`Creating room (${opts.gameId})`);
  let gameId = opts.gameId;
  let maxPlayers = opts.maxPlayers;

  if(Object.keys(rooms).includes(gameId)) {
    console.log('Room is occupied!');
    return false;
  }

  rooms[gameId] = {
    maxPlayers: maxPlayers,
    password: '',
    players: {},
  };
  
  console.log(`Created room (${gameId})!`);
  console.log(rooms);

  return true;
};


game.generateNewId = function(opts) {
  console.log('Generating ID...');
  return utils.generateId(gameIdLength);
};


game.readyPlayer = function(opts) {
  console.log(`Readying player (${opts.player.id})...`);
  let gameId = opts.gameId;
  let player = opts.player;

  if(!validateGameRoom(gameId) && !validatePlayer(gameId, player)) { return; }

  rooms[gameId].players[player.id].ready = true;

  console.log(`Player readied (${player.id})!`);

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

  console.log('Ready state:');
  console.log(players);

  if (numPlayers < 2) { gameReady = false; }

  let readyState = {
    gameReady: gameReady,
    numReady: playerReadyCount,
    numPlayers: numPlayers
  };

  return readyState;
};

game.unReadyPlayer = function(opts) {
  console.log(`Unreadying a player (${opts.player.id})...`);
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

  console.log('Player unreadied!');
  console.log(rooms[gameId].players);

  let readyState = {
    gameReady: gameReady,
    numReady: playerReadyCount,
    numPlayers: numPlayers
  };

  return readyState;
};


game.removePlayer = function(opts) {
  console.log(`Removing player ${opts.player.id} from room ${opts.gameId}`);

  let gameId = opts.gameId;
  let player = opts.player;

  if (!validateGameRoom(gameId) && !validatePlayer(gameId, player)) { return; }

  delete rooms[gameId].players[player.id];

  console.log(`Player state after removing:`);
  console.log(rooms[gameId].players);
};

game.startGame = (namespace, opts) => {
  console.log(`Starting game (${opts.gameId})...`);
  let gameId = opts.gameId;
  
  let squareData = {
    x: Math.floor(Math.random() * 100) - 50,
    y: Math.floor(Math.random() * 100) - 50
  };

  console.log(`Spawning square (${squareData.x} ${squareData.y})...`);
  namespace.to(gameId).emit('square-spawn', squareData);
  console.log('Square spawned!');

  for (let i = 0; i < 2000; i++) {
    let x = i;
  }

  console.log('Starting round...');
  namespace.to(gameId).emit('round-start');
  console.log('Game started!');
};

game.update = function(opts) {
  let that = this;
};

module.exports = game;