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
  let gameId = opts.gameId;
  let player = opts.player;

  if(!validateGameRoom(gameId)) { return; }

  rooms[gameId].players[player.id] = {
    ready: false,
    score: 0
  };
  console.log('Added player to room: ' + player.id);
  console.log(rooms);
};


game.create = function(opts) {
  let gameId = opts.gameId;

  if(Object.keys(rooms).includes(gameId)) {
    return false;
  }

  rooms[gameId] = {
    players: {},
    squares: []
  };
  console.log('Created room with id: ' + gameId);
  console.log(rooms);

  return true;
};


game.generateNewId = function(opts) {
  return utils.generateId(gameIdLength);
};


game.readyPlayer = function(opts) {
  let gameId = opts.gameId;
  let player = opts.player;

  if(!validateGameRoom(gameId) && !validatePlayer(gameId, player)) { return; }

  rooms[gameId].players[player.id].ready = true;

  let gameReady = true;
  let players = rooms[gameId].players;
  let playerKeys = Object.keys(players);

  for (var i = 0; i < playerKeys.length; i++) {
    if(!players[playerKeys].ready) {
      gameReady = false;
    }
  }

  return gameReady;
};

game.unReadyPlayer = function(opts) {
  let gameId = opts.gameId;
  let player = opts.player;

  if (!validateGameRoom(gameId) && !validatePlayer(gameId)) { return; }

  rooms[gameId].players[player.id].ready = false;
};


game.startGame = (namespace, opts) => {
  let gameId = opts.gameId;
  
  let squareData = {
    x: Math.floor(Math.random() * 100) - 50,
    y: Math.floor(Math.random() * 100) - 50
  };

  console.log('Game is started!');

  namespace.to(gameId).emit('square-spawn', squareData);

  for (let i = 0; i < 2000; i++) {
    let x = i;
  }

  namespace.to(gameId).emit('round-start');
};

game.update = function(opts) {
  let that = this;
};

module.exports = game;