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
};

gameService.disconnect = function() {
  if (gameSocket && gameSocket.connected) {
    console.log('Disconnecting...');
    gameSocket.emit('disconnecting', {gameId: gameId, playerId: 'player1'});
    gameSocket.close('userId');
    console.log('Disconnected!');
  }
};

gameSocket.on('player-scored', (data) => {
  
});

exports = gameService;