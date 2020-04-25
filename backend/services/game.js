let utils = require('../utils/utils');

const gameIdLength = 10;

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

  rooms[gameId].players[player.id] = {
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

  if(Object.keys(rooms).includes(gameId)) {
    console.log('Room is occupied!');
    return false;
  }

  rooms[gameId] = {
    players: {},
    squares: []
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

  console.log('Player readied!');

  let gameReady = true;
  let players = rooms[gameId].players;
  let playerKeys = Object.keys(players);

  for (var i = 0; i < playerKeys.length; i++) {
    if(!players[playerKeys].ready) {
      gameReady = false;
    }
  }

  console.log('Ready state:');
  console.log(players);

  return gameReady;
};

game.unReadyPlayer = function(opts) {
  console.log(`Unreadying a player (${opts.player.id})...`);
  let gameId = opts.gameId;
  let player = opts.player;

  if (!validateGameRoom(gameId) && !validatePlayer(gameId)) { return; }

  rooms[gameId].players[player.id].ready = false;
  console.log('Player unreadied!');
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