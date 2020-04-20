var playerService = {};

var playerInfo = null;

playerService.load = function() {
  playerInfo = {
    id: null,
    name: null
  };

  let cookie = document.cookie;

  if (cookie && cookie.includes('playerId')) {
    playerInfo.id = cookie.substring(cookie.indexOf('playerId') + 'playerId'.length + 1);
  } else {
    this.getNewId();
  }
}

playerService.updateName = function (name) {
  console.log(name);
  playerInfo.name = name;

  if(document.cookie.includes('playerName')) {
    let cookies = document.cookie.split('=');
    let playerNameIndex = cookies.indexOf('playerName') + 1;

    // set the player name

  }
};

playerService.updateScore = function (score) {
  playerInfo.score = this.score;
};

playerService.getNewId = function () {
  // call backend service to get a player id
  $.post('/players', function(data) {
    console.log(data);
    playerInfo.id = data.playerId;
    document.cookie = `playerId=${data.playerId};`;
  });
};

exports = playerService;