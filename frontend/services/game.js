let gameSocket = null;

var gameService = {};

gameService.createGame = function() {
  $.post('/games', {}, function(data) {
    gameSocket = io(data.gameId);
  });
};

gameService.connect = function(gameId) {
  gameSocket = io('http://localhost');
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
  });
};

gameService.disconnect = function() {
  if (gameSocket && gameSocket.connected) {
    console.log('Disconnecting...');
    gameSocket.emit('disconnecting', {gameId: gameId, playerId: 'player1'});
    gameSocket.close('userId');
    console.log('Disconnected!');
  }
};

gameService.score = function(gameId, playerId, score) {
  console.log('attmepting to score');
  score++;
  gameSocket.emit('player-scored', {gameId: gameId, playerId: playerId, score: score})
}

exports = gameService;