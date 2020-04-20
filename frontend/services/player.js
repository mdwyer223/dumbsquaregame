let playerService = {};

let playerInfo = null;

var playerRef = this;

playerService.load = function() {
  playerInfo = {
    id: null,
    name: null
  };

  let cookie = document.cookie;

  if (cookie && cookie.includes('playerId')) {
    playerInfo.id = cookie.substring(cookie.indexOf('playerId'), cookie.indexOf(';'), cookie.indexOf('playerId')).split('=')[1];
  } else {
    this.getNewId();
  }
}

playerService.updateName = function (name) {
  playerInfo.name = this.name;
};

playerService.updateScore = function (score) {
  playerInfo.score = this.score;
};

playerService.getNewId = function () {
  // call backend service to get a player id
  $.post('/players', function(data) {
    playerRef.playerInfo.id = data.playerId;
    document.cookie = `playerId=${playerId};`;
  });
};

exports = playerService;