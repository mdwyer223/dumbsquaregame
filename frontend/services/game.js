let gameSocket = null;

let gameService = {
  id: null,
  gameCreated: false
};

gameService.addPlayer = function (gameId, playerId, playerName) {
  console.log('Sending player-joined event...');
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
  console.log('Creating game...');
  $.post(`/games/${gameId}`, function(data) {
    if (data['message']) {
      console.warn('Game was not created!');
      gameService.gameCreated = false;
    } else {
      console.log('Game created successfully!');
      gameService.gameCreated = true;
    }
  });
};


gameService.connect = function () {
  console.log('Connecting socket...');
  gameSocket = io();
  gameService.setupSocket(gameSocket);
  console.log('Socket connected!');
};


gameService.disconnect = function (gameId, playerId) {
  if (gameSocket && gameSocket.connected) {
    console.log('Disconnecting player...');
    let data = {
      gameId: gameId,
      player: {
        id: playerId
      }
    };
    gameSocket.emit('player-left', data);

    $(`#${playerId}`).remove();
    gameSocket.close();
    console.log('Player disconnected!');
  }
};


gameService.joinRoom = function (gameId) {
  if (gameId) {
    console.log(`Joining room (${gameId})`);
    gameSocket.emit('join-room', gameId);
  } else {
    // warn the player
    console.warn('Invalid game ID');
  }
};


gameService.readyCheck = function (gameId, playerId) {
  if (!gameService.gameCreated) {
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
  console.log(`Sending message (${message})...`);
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
  console.log('Setting up socket...');
  gameSocket.on('connect', function () {
    gameSocket.on('player-scored', function (data) {
      console.log('Player scored!');
      let points = data.score;
      if (data.player.id === 'jason') {
        $(".color-red .points span").text(points);
      } else {
        $(".color-green .points span").text(points);
      }
    });


    gameSocket.on('player-joined', function (data) {
      console.log(`New player joined: ${data.player.name} ${data.player.id}`);
      let players = data.players;
      console.log(players);
      let playerKeys = Object.keys(players);
      for(let i = 0; i < playerKeys.length; i++) {
        let playerData = players[playerKeys[i]]
        console.log(`Checking if player exists on the scoreboard ${playerData.id} ${playerData.name} ${playerData.score}`);
        if (isEmpty($(`#${playerData.id}`))) {
          $('.sidebar .scoreboard').append(`<div id="${playerData.id}" class="player ${playerData.color}"><div class="name">${playerData.name}</div><div class="points"><span>${playerData.score}</span>pts</div></div>`);
        }
      }
    });


    gameSocket.on('player-left', function (data) {
      console.log(`Player left: ${data.player.name} ${data.player.id}`)
      $(`#${data.player.id}`).remove();
    });


    gameSocket.on('message-sent', function (data) {
      console.log(`Message recieved: ${data.msg}`);
      let messageString = data.msg;
      let playerId = data.player.id;
      let playerName = data.player.name;

      if (messageString.length > 0) {
        $('.chat .messages').append(`<p class="message"><strong class="playerColor ${playerId}"> ${playerName}: </strong>${messageString}</p>`);
        $(".chat .messages").scrollTop(9999999999);
      }
    });


    gameSocket.on('round-ready', function (data) {
      console.log('Round ready!');
      $(".canvas .ready").text("Get ready");
    });


    gameSocket.on('round-start', function (data) {
      console.log('Round start!');
      $(".canvas .square").removeClass("display-none");
      $(".canvas .ready").addClass("display-none");
    });


    gameSocket.on('square-spawn', function (data) {
      console.log(`Recieved square spawn: ${data.x} ${data.y}`);
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
      let cssLeft = `calc(${left}% ${calcPercentLeft})`;

      $(".canvas .square").css("top", cssTop);
      $(".canvas .square").css("left", cssLeft);
    });


    gameSocket.on('waiting-for-players', function (data) {
      console.log('Waiting for others...');
      $(".canvas .ready").text("Waiting for players");
    });
  });
  console.log('Socket set up!');
};


gameService.unReadyCheck = function (gameId, playerId) {
  if (!gameService.gameCreated) {
    return;
  }

  console.log(`Sending unready check (${playerId})`);

  let data = {
    gameId: gameId,
    playerId: playerId
  };
  gameSocket.emit('player-not-ready', data);
};


gameService.updateGameId = function(gameId) {
  console.log(`Setting game ID (${gameId})...`)
  gameService.id = gameId;
};

exports = gameService;
