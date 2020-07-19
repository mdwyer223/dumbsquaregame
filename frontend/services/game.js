let gameSocket = null;

let gameService = {
  id: null,
  gameCreated: false
};

let squareCounter = 0;

let offsetTop = 0;
let offsetLeft = 0;

let game_self = this;

function compareRoundwins(a,b) {
  const winsA = a.roundWins;
  const winsB = b.roundWins;

  let comparison = 0;
  if (winsA > winsB) { comparison = -1; }
  else if (winsB > winsA) { comparison = 1; }

  return comparison;
}

gameService.addPlayer = function (gameId, playerId, playerName, playerColor, password) {
  console.log('Sending player-joined event...');
  let data = {
    gameId: gameId,
    password: password,
    player: {
      id: playerId,
      name: playerName,
      color: playerColor
    }
  };
  gameSocket.emit('player-joined', data);
  gameSocket.emit('player-not-ready', data);
};


gameService.createGame = function (gameId, maxPlayers, maxPoints, password) {
  console.log('Creating game...');
  let passField = password ? `?p=${password}` : ''
  $.post(`/games/${gameId}/${maxPlayers}/${maxPoints}${passField}`, function (data) {
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
    $(`.canvas .${playerId}`).remove();
    squareCounter = 0;
    gameSocket.close();
    console.log('Player disconnected!');
  }
};


gameService.joinRoom = function (gameId) {
  if (gameId) {
    console.log(`Joining room (${gameId})`);
    gameSocket.emit('join-room', gameId);
    squareCounter = 0;
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


gameService.score = function (gameId, playerColor, playerId, playerName) {
  let data = {
    gameId: gameId,
    player: {
      name: playerName,
      color: playerColor,
      id: playerId
    }
  }
  gameSocket.emit('player-scored', data);
  gameSocket.emit('player-not-ready', data);
};


gameService.sendMessage = function (gameId, playerColor, playerId, playerName, message) {
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


// gameService.sendMouseCoords = function (gameId, playerColor, playerId, x, y) {
//   let data = {
//     x: x,
//     y: y,
//     gameId: gameId,
//     player: {
//       id: playerId,
//       color: playerColor
//     }
//   };
//   gameSocket.emit('send-mouse-coords', data);
// }


gameService.setupSocket = function () {
  console.log('Setting up socket...');
  gameSocket.on('connect', function () {


    gameSocket.on('message-sent', function (data) {
      let messageString = data.msg;
      let playerColor = data.player.color;
      let playerId = data.player.id;
      let playerName = data.player.name;

      if (messageString.length > 0) {
        $('.chat .messages').append(`<p class="message inactive select player-message"><strong class="${playerColor} ${playerId}"> ${playerName}: </strong>${messageString}</p>`);
        $(".chat .messages").scrollTop(9999999999);

        setTimeout(function(){ 
          $(".message").removeClass("inactive");
        }, 1);
      }
    });
    

    gameSocket.on('player-scored', function (data) {
      let playerName = data.player.name;
      let points = data.score;
      let playerColor = data.player.color;
      let squareData = data.squareData

      $('.relic-wrapper').append(`<div class="relic-square counter-${squareCounter} ${playerColor}"></div>`);
      
      let windowWidth = $(window).width();
      let windowHeight = $(window).height();

      let rectangleSize = ((0.03 * windowWidth) + (0.04 * windowHeight));

      let offsetNum = (rectangleSize / 2);
      
      let top = squareData.x
      let left = squareData.y;
      
      let offsetPercentTop = 50 + top;
      let offsetPercentLeft = 50 + left;
      
      let offsetCSSTop = (`calc(${offsetPercentTop}% ${offsetTop} - ${offsetNum}px)`);
      let offsetCSSLeft = (`calc(${offsetPercentLeft}% ${offsetLeft} - ${offsetNum}px)`);
      
      $(`.counter-${squareCounter}`).css("top", offsetCSSTop);
      $(`.counter-${squareCounter}`).css("left", offsetCSSLeft);

      let relicPosition = $(`.counter-${squareCounter}`).position();
      let canvasPosition = $(`.canvas`).position();
      let relicNamePositionTop = 0;

      if (top < -26) {
        relicNamePositionTop = canvasPosition.top + relicPosition.top + rectangleSize + 12;
        $('.game-wrapper').append(`<div class="relic-name relic-down counter-name-${squareCounter} ${playerColor}"></div>`);
      } else {
        relicNamePositionTop = canvasPosition.top + relicPosition.top - 32;
        $('.game-wrapper').append(`<div class="relic-name relic-up counter-name-${squareCounter} ${playerColor}"></div>`);
      }

      setTimeout(function(squareCount) {
        $(`.game-wrapper .counter-name-${squareCount}`).remove();
      }, 1000, squareCounter);

      let relicNamePositionLeft = canvasPosition.left + relicPosition.left - 150 + (rectangleSize / 2) + 17;

      $(`.counter-name-${squareCounter}`).css(`top`, `${relicNamePositionTop}px`);
      $(`.counter-name-${squareCounter}`).css(`left`, `${relicNamePositionLeft}px`);

      $(`.counter-name-${squareCounter}`).text(`${playerName} +1pt`);

      squareCounter++;

      $(canvasReadyButton).removeClass("display-none");
      $(gameSquare).addClass("display-none");

      $(`#${data.player.id} .points span`).text(`${points}`);
    });


    gameSocket.on('player-cannot-join', function (data) {
      if (data.player.id == playerInfo.id) {
        console.log('Could not join the game...');
        gameSocket.close();
        switchToMainMenu();
        console.log(data.error);
      }
    });


    gameSocket.on('player-joined', function (data) {
      let players = data.players;
      let playerKeys = Object.keys(players);

      $(".scoreboard h2").text(`Room: ${data.gameId}`);

      for (let i = 0; i < playerKeys.length; i++) {
        let playerData = players[playerKeys[i]];
        if (isEmpty($(`#${playerData.id}`))) {
          if (playerData.id === playerInfo.id) {
            $('.sidebar .scoreboard-container').append(`<div id="${playerData.id}" class="inactive player ${playerData.color}"><div class="name">${playerData.name}</div><div class="you-identifier">YOU</div><div class="points"><div class="mobile-divider">- </div><span>${playerData.score}</span>pts</div></div>`);            
          } else {
            $('.sidebar .scoreboard-container').append(`<div id="${playerData.id}" class="inactive player ${playerData.color}"><div class="name">${playerData.name}</div><div class="points"><div class="mobile-divider">- </div><span>${playerData.score}</span>pts</div></div>`);
          }
        }
      }

      let namePlace = 0;
      let container = $('.scoreboard-container > div');
      let containerLength = container.length;
      for (namePlace = 0; namePlace < containerLength; namePlace++) {
        let playerPlace = namePlace + 2;
        setTimeout(function(){ 
          $(".scoreboard .player:nth-child(" + playerPlace + ")").removeClass("inactive");
        }, (namePlace * 60) + 60);
      }

      if (data.roundReset) {
        if ($('.play-again-button').length === 0) {
          $(canvas).prepend(`<div class="round-leaderboard"><div class="play-again-button"><div>Click to ready up</div></div>`);
          $(".play-again-button").click(function () {
            gameService.readyCheck(gameService.id, playerInfo.id);
          });
        }
      }
    });


    gameSocket.on('player-left', function (data) {
      $(`#${data.player.id}`).remove();
      $(`.canvas .${data.player.id}`).remove();
    });


     gameSocket.on('player-won-round', function (data) {
      console.log('Round is over!');

      $(`#${data.player.id} .points span`).text(`${data.score}`);

      let players = data.players;
      let roundWinner = data.player;
      let playerList = [];
      let playerIds = Object.keys(players);

      playerIds.forEach(function(id){
        playerList.push(players[id]);
      })

      playerList.sort(compareRoundwins);

      roundWon(roundWinner.color, roundWinner.name, playerList);
    });


    gameSocket.on('round-ready', function (data) {
      let numReady = data.numReady;
      let numPlayers = data.numPlayers;
      $(".canvas .ready div").text(`Get ready! ${numReady}/${numPlayers}`);
    });


    gameSocket.on('round-start', function (data) {
      $(".canvas .square").removeClass("display-none");
      $(".canvas .ready").addClass("display-none");
    });


    gameSocket.on('square-spawn', function (data) {
      $(".round-leaderboard").remove();

      if (data.roundReset) {
        $(`.points span`).text("0");
        squareCounter = 0;
      }

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

      offsetTop = pixelOffsetTop;
      offsetLeft = pixelOffsetLeft;
      
      $(".canvas .square").css("top", cssTop);
      $(".canvas .square").css("left", cssLeft);
    });


    // gameSocket.on('update-mouse-coords', function(data) {
    //   let playerColor = data.player.color;
    //   let playerId = data.player.id;

    //   let x = data.x;
    //   let y = data.y;

    //   // draw on the canvas here
    //   let topVal =  `${parseInt(y * $(window).height())}px`;
    //   let leftVal = `${parseInt(x *  $(window).width())}px`;
    //   $(`.canvas .${playerId}`).css('top', topVal);
    //   $(`.canvas .${playerId}`).css('left', leftVal);
    // });


    gameSocket.on('waiting-for-players', function (data) {
      let numReady = data.numReady;
      let numPlayers = data.numPlayers;
      if (!data.roundReset) {
        if (numReady === 0) {
          $(".canvas .ready div").text(`Hold mouse here to start`);
        } else {
          $(".canvas .ready div").text(`Waiting for players - ${numReady}/${numPlayers}`);
        }
      } else {
        if (numReady === 0) {
          $(".canvas .play-again-button div").text(`Click to ready up`);
        } else {
          $(".canvas .play-again-button div").text(`Click to ready up - ${numReady}/${numPlayers}`);
        }
      }
      
    });
  });
  console.log('Socket set up!');
};


gameService.unReadyCheck = function (gameId, playerId) {
  let data = {
    gameId: gameId,
    player: {
      id: playerId
    }
  };
  gameSocket.emit('player-not-ready', data);
};


gameService.updateGameId = function (gameId) {
  gameService.id = gameId;
};

exports = gameService;
