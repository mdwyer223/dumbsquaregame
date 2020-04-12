let files = require('../utils/game-file-system');

let game = {};

function makeGameId(length) {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Need a method to create a new game
game.create = function(opts) {
  let gameIdLength = 10;

  let gameId = makeGameId(gameIdLength);

  let newGameContents = {
    seesionId: gameId,
    canScore: true,
    players: []
  };

  files.write(gameId, newGameContents);

  return gameId;
};

// Need a method to add a player
game.addPlayer = function(opts) {
  let that = this;

  let newPlayer = {
    id: opts.player.id,
    name: opts.player.name,
    score: 0
  };

  let gameContent = files.read(opts.gameId);

  gameContent.players.push(newPlayer);

  files.write(opts.gameId, gameContent);

  return newPlayer;
}


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


// Need a way to reset the round for everyone to score
game.resetRound = function(opts) {
  
}

// Need a method to retun the information about the games

module.exports = game;