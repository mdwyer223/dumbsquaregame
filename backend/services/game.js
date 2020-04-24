let files = require('../utils/game-file-system');
let utils = require('../utils/utils');

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


// Need a method to create a new game
game.create = function(opts) {
  let gameId = opts.gameId;
  rooms[gameId] = {
    players: {},
    squares: []
  };
  console.log('Created room with id: ' + gameId);
  console.log(rooms);
};

// Need a method to add a player
game.addPlayer = function(opts) {
  let gameId = opts.gameId;
  let player = opts.player;

  rooms[gameId].players[player.id] = {
    ready: false,
    score: 0
  };
  console.log('Added player to room: ' + player.id);
  console.log(rooms);
};


game.readyPlayer = function(opts) {
  let gameId = opts.gameId;
  let player = opts.player;

  rooms[gameId].players[player.id].ready = true;

  // check all players in the room
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

  rooms[gameId].players[player.id].ready = false;
};

// Need a method to update the score of an old game
game.update = function(opts) {
  let that = this;
  if (opts.player === null) {
    console.log('No player defined!');
    return;
  } 
    
  if (opts.gameId === null) {
    console.log('No game ID defined');
    return;
  }

  let gameContent = files.read(gameId);

  console.log(gameContent);

  let players = gameContent.players;
  let scoreIncremental = 1;
  let playerPosition = 0;
  if(gameContent.canScore) {
    players.forEach(function(player) {
      if (player.id === opts.player.id) {
        return;
      }
      that.playerPosition++;
    });

    gameContent.players[playerPosition].score += scoreIncremental;

    files.write(opts.gameId, gameContent)
  }

  return gameContent;
}

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

// Need a way to reset the round for everyone to score
game.resetRound = function(opts) {
  
}

// Need a method to retun the information about the games

module.exports = game;