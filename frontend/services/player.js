var playerService = {};

var playerInfo = null;

playerService.load = function() {
  playerInfo = {
    id: null,
    name: null,
    color: null
  };

  let cookie = document.cookie;

  if (cookie && cookie.includes('playerId')) {
    playerInfo.id = cookie.substring(cookie.indexOf('playerId') + 'playerId'.length + 1);
  } else {
    this.getNewId();
  }
}

playerService.updateColor = function (color) {
  playerInfo.color = color;
}

playerService.updateName = function (name) {
  playerInfo.name = name;
};

playerService.updateScore = function (score) {
  playerInfo.score = this.score;
};

playerService.getNewId = function () {
  $.post('/players', function(data) {
    console.log(data);
    playerInfo.id = data.playerId;
    document.cookie = `playerId=${data.playerId};`;
  });
};

exports = playerService;