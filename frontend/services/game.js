let gameSocket = null;

let gameService = {};

let players = [];

var gameId = "fakeid";
var gameCreated = false;

gameService.addPlayer = function (playerId, playerName) {
  gameSocket.emit('player-joined', {
    gameId: gameId,
    
    player: {
      id: playerId,
      name: playerName
    }
    
  })
};

gameService.createGame = function () {
  let data = {
    gameId: gameId
  };
  gameSocket.emit('create-room', data);
  gameCreated = true;
  //setup socket
};

gameService.joinRoom = function (gameId) {
  gameSocket.emit('join-room', gameId);
  //setup socket
};

gameService.setupSocket = function () {

};

gameService.connect = function (gameId) {
  gameSocket = io();
  gameSocket.emit('join-room', gameId);

  gameSocket.on('connect', function () {
    gameSocket.on('player-scored-confirmed', function (data) {
      let points = data.score;
      console.log('received event');
      if (data.playerId === 'jason') {
        console.log('Jason scored!');
        $(".color-red .points span").text(points);
      } else {
        console.log('Matt scored');
        $(".color-green .points span").text(points);
      }
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

    gameSocket.on('player-joined', function (data) {

      let playerId = data.player.id;
      let playerName = data.player.name;
      
      $('.sidebar .scoreboard').append(`<div id="${playerId}" class="player color-red"><div class="name">${playerName}</div><div class="points"><span>0</span>pts</div></div>`);

    });

    gameSocket.on('round-ready', function (data) {
      console.log('Round is ready');
      $(".canvas .ready").text("Get ready");

    });

    gameSocket.on('round-start', function (data) {
      console.log('Round started');

      $(".canvas .square").removeClass("display-none");
      $(".canvas .ready").addClass("display-none");

    });

    gameSocket.on('square-spawn', function (data) {
      console.log('Square spawn received');
      let rand1 = data.x;
      let rand2 = data.y;

      // Set variable that signals whether the random # is negative or positive

      let negOrPos1 = "+";
      let negOrPos2 = "+";

      let windowWidth = $(window).width();
      let windowHeight = $(window).height();

      let rectangleSize = ((0.03 * windowWidth) + (0.04 * windowHeight));

      let offsetNum = ((rectangleSize / 2) + 12);
      let offsetString = offsetNum.toString();
      let offsetCSS = (offsetString + "px");

      // console.log(windowWidth + "windowWidth");
      // console.log(windowHeight + "windowHeight");
      // console.log(rectangleSize + "rectangleSize");
      // console.log(offsetNum + "offsetNum");
      // console.log(offsetString + "offsetString");
      // console.log(offsetCSS + "offsetCSS");

      if (rand1 > 40) {

        // If the random # is very positive
        // Subtract 52px to make sure the rectangle
        // does not position off screen
        negOrPos1 = "-" + offsetCSS;

      } else if (rand1 < -40) {

        // If the random # is very negative
        // Add 52px to make sure the rectangle
        // does not position off screen
        negOrPos1 = "+" + offsetCSS;;

      } else {

        // If the random # is neutral then we don't reposition
        negOrPos1 = "+ 0px";

      }

      if (rand2 > 40) {

        // If the random # is very positive
        // Subtract 52px to make sure the rectangle
        // does not position off screen
        negOrPos2 = "-" + offsetCSS;;

      } else if (rand2 < -40) {

        // If the random # is very negative
        // Add 52px to make sure the rectangle
        // does not position off screen
        negOrPos2 = "+" + offsetCSS;;

      } else {

        // If the random # is neutral then we don't reposition
        negOrPos2 = "+ 0px";

      }

      // Take the random number and the positive or negative compensation
      // This dictates the final X and Y position of the square

      let fullString1 = "calc(" + rand1 + "% " + negOrPos1 + ")";
      let fullString2 = "calc(" + rand2 + "% " + negOrPos2 + ")";

      // Log to track all the variables above

      // console.log(rand1);
      // console.log(rand2);
      // console.log(offsetCSS);
      // console.log(negOrPos1);
      // console.log(negOrPos2);
      // console.log(fullString1);
      // console.log(fullString2);

      // Set the CSS to randomly position the square

      $(".canvas .square").css("top", fullString1);
      $(".canvas .square").css("left", fullString2);

    });

    gameSocket.on('waiting-for-players', function (data) {

      $(".canvas .ready").text("Waiting for players");

    });
    
    gameSocket.on('player-left', function (data) {
      
      console.log("player left1");

      $(`#${playerId}`).remove();

    });
  });
};

gameService.disconnect = function (gameId, playerId) {
  if (gameSocket && gameSocket.connected) {
    gameSocket.emit('player-left', {
      gameId: gameId,
      playerId: playerId
    });
    
    console.log("player left2");
    $(`#${playerId}`).remove();
    
    gameSocket.close();
  }
};

gameService.score = function (gameId, playerId, score) {
  console.log('attempting to score');
  score++;
  gameSocket.emit('player-scored', {
    gameId: gameId,
    playerId: playerId,
    score: score
  })
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

gameService.readyCheck = function (gameId, playerId) {
  if (!gameCreated) {
    return;
  }
  let data = {
    gameId: gameId,
    playerId: playerId
  };

  gameSocket.emit('player-ready', data);
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

exports = gameService;
