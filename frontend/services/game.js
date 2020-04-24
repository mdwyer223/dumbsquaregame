let gameSocket = null;

let gameService = {
  id: null,
  gameCreated: false
};

gameService.addPlayer = function (gameId, playerId, playerName) {
  let data = {
    gameId: gameId,
    player: {
      id: playerId,
      name: playerName
    }
  };
  gameSocket.emit('player-joined', data);
};


gameService.createGame = function (gameId) {
  console.log(gameId);
  $.post(`/games/${gameId}`, function(data) {
    if (data['message']) {
      gameService.gameCreated = false;
    } else {
      gameService.gameCreated = true;
    }
  });
};


gameService.connect = function () {
  gameSocket = io();
};


gameService.disconnect = function (gameId, playerId) {
  if (gameSocket && gameSocket.connected) {
    let data = {
      gameId: gameId,
      player: {
        id: playerId
      }
    };
    gameSocket.emit('player-left', data);

    $(`#${playerId}`).remove();
    gameSocket.close();
  }
};


gameService.joinRoom = function (gameId) {
  if (gameId) {
    gameSocket.emit('join-room', gameId);
  } else {
    // warn the player
    console.warn('Invalid game ID');
  }
};


gameService.readyCheck = function (gameId, playerId) {
  if (!gameCreated) {
    return;
  }
  let data = {
    gameId: gameId,
    player: {
      id: playerId
    }
  };
  gameSocket.emit('player-ready', data);
};


gameService.score = function (gameId, playerId, score) {
  score++;
  let data = {
    gameId: gameId,
    player: {
      id: playerId
    },
    score: score
  }
  gameSocket.emit('player-scored', data);
};


gameService.sendMessage = function (gameId, playerId, playerName, message) {
  let data = {
    gameId: gameId,
    player: {
      id: playerId,
      name: playerName
    },
    msg: sanitize(message)
  };
  gameSocket.emit('send-message', data);
};


gameService.setupSocket = function () {
  gameSocket.on('connect', function () {
    gameSocket.on('player-scored', function (data) {
      let points = data.score;
      console.log('received event');
      if (data.player.id === 'jason') {
        console.log('Jason scored!');
        $(".color-red .points span").text(points);
      } else {
        console.log('Matt scored');
        $(".color-green .points span").text(points);
      }
    });

    gameSocket.on('player-joined', function (data) {

      let playerId = data.player.id;
      let playerName = data.player.name;
      
      $('.sidebar .scoreboard').append(`<div id="${playerId}" class="player color-red"><div class="name">${playerName}</div><div class="points"><span>0</span>pts</div></div>`);

    });

    gameSocket.on('player-left', function (data) {
      $(`#${playerId}`).remove();
    });

    gameSocket.on('message-sent', function (data) {
      let messageString = data.msg;
      let playerId = data.player.id;
      let playerName = data.player.name;

      if (messageString.length > 0) {
        $('.chat .messages').append(`<p class="message"><strong class="playerColor ${playerId}"> ${playerName}: </strong>${messageString}</p>`);
        $(".chat .messages").scrollTop(9999999999);
      }
    });

    gameSocket.on('round-ready', function (data) {
      $(".canvas .ready").text("Get ready");
    });

    gameSocket.on('round-start', function (data) {
      $(".canvas .square").removeClass("display-none");
      $(".canvas .ready").addClass("display-none");

    });

    gameSocket.on('square-spawn', function (data) {
      let top = data.x;
      let left = data.y;

      // Set variable that signals whether the random # is negative or positive
      let calcPercentTop = "+ 0px";
      let calcPercentLeft = "+ 0px";

      let windowWidth = $(window).width();
      let windowHeight = $(window).height();

      let rectangleSize = ((0.03 * windowWidth) + (0.04 * windowHeight));

      let offsetNum = ((rectangleSize / 2) + 12);
      let offsetString = offsetNum.toString();
      let offsetCSS = (offsetString + "px");

      // Check upper and lower limit of the bounds
      if (top > 40) {
        calcPercentTop = `- ${offsetCSS}`;
      } else if (top < -40) {
        calcPercentTop = `+ ${offsetCSS}`;
      }

      if (left > 40) {
        calcPercentLeft = `- ${offsetCSS}`;
      } else if (left < -40) {
        calcPercentLeft = `+ ${offsetCSS}`;
      }

      // Create CSS formula for the element
      let cssTop = `calc(${top}% ${calcPercentTop})`;
      let cssLeft = `calc(${left}% ${calcPercentleft})`;

      $(".canvas .square").css("top", cssTop);
      $(".canvas .square").css("left", cssLeft);
    });

    gameSocket.on('waiting-for-players', function (data) {
      $(".canvas .ready").text("Waiting for players");
    });
  });
};


gameService.unReadyCheck = function (gameId, playerId) {
  if (!gameCreated) {
    return;
  }

  let data = {
    gameId: gameId,
    playerId: playerId
  };
  gameSocket.emit('player-not-ready', data);
};


gameService.updateId = function(gameId) {
  gameService.id = gameId;
};

exports = gameService;
