let gameSocket = null;

let gameService = {};

let players = [];

var gameId = "fakeid";

gameService.createGame = function() {
  $.post('/games', {}, function(data) {
    gameSocket = io(data.gameId);
  });
};

gameService.connect = function(gameId) {
  gameSocket = io();
  gameSocket.emit('room', gameId);

  gameSocket.on('connect', function() {
    gameSocket.on('player-scored-confirmed', function(data) {
      let points = data.score;
      console.log('received event');
      if(data.playerId === 'jason') {
        console.log('Jason scored!');
        $(".color-red .points span").text(points);
      } else {
        console.log('Matt scored');
        $(".color-green .points span").text(points);
      }
    });

    gameSocket.on('message-sent', function(data) {
      
      let messageString = data.msg;
      let playerId = data.playerId;
      let playerName = data.playerName;
      
      if (messageString.length > 0) {
        $('.chat .messages').append(`<p class="message"><strong class="playerColor ${playerId}"> ${playerName}: </strong>${messageString}</p>`);
        $(".chat .messages").scrollTop(9999999999);
      }
    });

    gameSocket.on('round-ready', function(data) {
      // all players passed ready check
    });

    gameSocket.on('round-start', function(data) {
      // display the square
    });

    gameSocket.on('square-spawn', function(data) {
      // set the square coordinates
    });

    gameSocket.on('waiting-for-players', function(data) {
      // waiting for people to pass ready check
    });
  });
};

gameService.disconnect = function() {
  let gameId = 'fakeid';
  if (gameSocket && gameSocket.connected) {
    gameSocket.emit('disconnecting', {gameId: gameId, playerId: 'player1'});
    gameSocket.close();
  }
};

gameService.score = function(gameId, playerId, score) {
  console.log('attmepting to score');
  score++;
  gameSocket.emit('player-scored', {gameId: gameId, playerId: playerId, score: score})
};

gameService.sendMessage = function(gameId, player, message) {
  let data = {
    gameId: gameId,
    playerId: player.id,
    playerName: player.name,
    msg: sanitize(message)
  };
  gameSocket.emit('send-message', data);
};

gameService.readyCheck = function(gameId, playerId) {
  let data = {
    gameId: gameId,
    playerId: playerId
  };

  gameSocket.emit('player-ready', data);
};

gameService.unReadyCheck = function(gameId, playerId) {
  let data = {
    gameId: gameId,
    playerId: playerId
  };

  gameSocket.emit('player-not-ready', data);
};

exports = gameService;