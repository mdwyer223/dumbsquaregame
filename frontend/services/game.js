let gameSocket = null;

let gameService = {
  id: null,
  gameCreated: false
};

var squarePos = [];

let squareCounter = 0;

gameService.addPlayer = function (gameId, playerId, playerName, playerColor) {
  console.log('Sending player-joined event...');
  let data = {
    gameId: gameId,
    player: {
      id: playerId,
      name: playerName,
      color: playerColor
    }
  };
  gameSocket.emit('player-joined', data);
};


gameService.createGame = function (gameId, maxPlayers) {
  console.log('Creating game...');
  $.post(`/games/${gameId}/${maxPlayers}`, function (data) {
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
  console.log(`Sending ready check (${playerId})`);

  let data = {
    gameId: gameId,
    player: {
      id: playerId
    }
  };
  gameSocket.emit('player-ready', data);
};


gameService.score = function (gameId, playerColor, playerId, score) {
  score++;
  let data = {
    gameId: gameId,
    player: {
      color: playerColor,
      id: playerId
    },
    score: score
  }
  gameSocket.emit('player-scored', data);
  gameSocket.emit('player-not-ready', data);
};


gameService.sendMessage = function (gameId, playerColor, playerId, playerName, message) {
  console.log(`Sending message (${message})...`);
  let data = {
    gameId: gameId,
    player: {
      id: playerId,
      name: playerName,
      color: playerColor
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
      let playerColor = data.player.color;

      $('.relic-wrapper').append(`<div class="relic-square counter-${squareCounter} ${playerColor}"></div>`);

      let canvasWidth = $(".canvas").width();
      let canvasHeight = $(".canvas").height();
      
      let windowWidth = $(window).width();
      let windowHeight = $(window).height();

      let rectangleSize = ((0.03 * windowWidth) + (0.04 * windowHeight));

      let offsetNum = (rectangleSize / 2);
      
      let top = squarePos[squareCounter].top;
      let left = squarePos[squareCounter].left;
      
      let offsetPercentTop = 50 + top;
      let offsetPercentLeft = 50 + left;
      
      let offsetTop = squarePos[squareCounter].offsetTop;
      let offsetLeft = squarePos[squareCounter].offsetLeft;
      
      let offsetCSSTop = (`calc(${offsetPercentTop}% ${offsetTop} - ${offsetNum}px)`);
      let offsetCSSLeft = (`calc(${offsetPercentLeft}% ${offsetLeft} - ${offsetNum}px)`);
      
      $(`.counter-${squareCounter}`).css("top", offsetCSSTop);
      $(`.counter-${squareCounter}`).css("left", offsetCSSLeft);
      
      squareCounter++;

      $(canvasReadyButton).removeClass("display-none");
      $(gameSquare).addClass("display-none");

      $(`#${data.player.id} .points span`).text(`${points}`);
    });


    gameSocket.on('player-cannot-join', function (data) {
      if (data.player.id == playerInfo.id) {
        console.log('Could not join the game...');
        gameSocket.close();
        switchToJoinGameMenu();
      }
    })


    gameSocket.on('player-joined', function (data) {
      console.log(`New player joined: ${data.player.name} ${data.player.id}`);
      let players = data.players;
      console.log(players);
      let playerKeys = Object.keys(players);
      for (let i = 0; i < playerKeys.length; i++) {
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
      console.log(`Message received: ${data.msg}`);
      let messageString = data.msg;
      let playerColor = data.player.color;
      let playerId = data.player.id;
      let playerName = data.player.name;

      if (messageString.length > 0) {
        $('.chat .messages').append(`<p class="message player-message"><strong class="${playerColor} ${playerId}"> ${playerName}: </strong>${messageString}</p>`);
        $(".chat .messages").scrollTop(9999999999);
        $(".chat .starter-message").addClass("display-none");
      }
    });


    gameSocket.on('round-ready', function (data) {
      console.log('Round ready!');
      let numReady = data.numReady;
      let numPlayers = data.numPlayers;
      $(".canvas .ready div").text(`Get ready! ${numReady}/${numPlayers}`);
    });


    gameSocket.on('round-start', function (data) {
      console.log('Round start!');
      $(".canvas .square").removeClass("display-none");
      $(".canvas .ready").addClass("display-none");
    });


    gameSocket.on('square-spawn', function (data) {
      console.log(`Received square spawn: ${data.x} ${data.y}`);
      let top = data.x;
      let left = data.y;
      
      

      // Set variable that signals whether the random # is negative or positive
      let pixelOffsetTop = "+ 0px";
      let pixelOffsetLeft = "+ 0px";

      let windowWidth = $(window).width();
      let windowHeight = $(window).height();

      let rectangleSize = ((0.03 * windowWidth) + (0.04 * windowHeight));

      let offsetNum = ((rectangleSize / 2) + 12);
      let offsetString = offsetNum.toString();
      let offsetCSS = (offsetString + "px");

      // Check upper and lower limit of the bounds
      if (top > 40) {
        pixelOffsetTop = `- ${offsetCSS}`;
      } else if (top < -40) {
        pixelOffsetTop = `+ ${offsetCSS}`;
      }

      if (left > 40) {
        pixelOffsetLeft = `- ${offsetCSS}`;
      } else if (left < -40) {
        pixelOffsetLeft = `+ ${offsetCSS}`;
      }

      // Create CSS formula for the element
      let cssTop = `calc(${top}% ${pixelOffsetTop})`;
      let cssLeft = `calc(${left}% ${pixelOffsetLeft})`;

      var squareData = {
        top:top, 
        left:left, 
        offsetTop:pixelOffsetTop, 
        offsetLeft:pixelOffsetLeft
      };
      
      squarePos.push(squareData);
      
      console.log(squareData.top);
      console.log(squarePos[0].top);
      
      $(".canvas .square").css("top", cssTop);
      $(".canvas .square").css("left", cssLeft);
    });


    gameSocket.on('waiting-for-players', function (data) {
      console.log('Waiting for others...');

      let numReady = data.numReady;
      let numPlayers = data.numPlayers;
      if (numReady === 0) {
        $(".canvas .ready div").text(`Hold mouse here to start`);
      } else {
        $(".canvas .ready div").text(`Waiting for players ${numReady}/${numPlayers}`);
      }
    });
  });
  console.log('Socket set up!');
};


gameService.unReadyCheck = function (gameId, playerId) {
  console.log(`Sending unready check (${playerId})`);

  let data = {
    gameId: gameId,
    player: {
      id: playerId
    }
  };
  gameSocket.emit('player-not-ready', data);
};


gameService.updateGameId = function (gameId) {
  console.log(`Setting game ID (${gameId})...`)
  gameService.id = gameId;
};

exports = gameService;
