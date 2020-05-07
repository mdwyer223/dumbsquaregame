var playerService = {};

var playerInfo = null;

playerService.load = function() {
  console.log('Loading player...');

  playerInfo = {
    id: null,
    name: null,
    color: 'color-red'
  };

  let cookie = document.cookie;

  if (cookie && cookie.includes('playerId')) {
    playerInfo.id = cookie.substring(cookie.indexOf('playerId') + 'playerId'.length + 1);
    console.log(`Player ID found! (${playerInfo.id})`);
  } else {
    this.getNewId();
  }
  console.log('Player loaded!');
}

playerService.updateColor = function (color) {
  console.log(`Updating color (${color})`)
  playerInfo.color = color;
}

playerService.updateName = function (name) {
  console.log(`Updating name (${name})...`);
  playerInfo.name = name;
};

playerService.updateScore = function (score) {
  console.log(`Updating score (${score})...`);
  playerInfo.score = this.score;
};

playerService.getNewId = function () {
  console.log('Getting new player ID...');
  $.post('/players', function(data) {
    console.log(data);
    playerInfo.id = data.playerId;
    document.cookie = `playerId=${data.playerId};`;
    console.log(`New player ID added to cookies! (${playerInfo.id})`);
  });
};

playerService.getRandomName = function () {
  $.get('/players/names', function(data) {
    console.log('Getting random name...');
    playerInfo.name = data.playerName;
    $('.player-info input').val(playerInfo.name);
  });
}

exports = playerService;