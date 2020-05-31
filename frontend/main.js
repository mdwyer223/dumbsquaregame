var backButton = '.back-button';

var canvas = '.canvas';
var canvasReadyButton = '.canvas .ready';
var chatBox = '.chat input';
var chatSendButton = '.chat .send-button';
var cheaterScrim = '.cheater-scrim';
var createGameMenuButton = '#create-game-menu';
var createGameColorPicker = '.create-game-wrapper .color-picker div';
var createGameWrapper = '.create-game-wrapper';
var exitButton = '.exit-button';

var gameSquare = '.canvas .square';
var gameWrapper = '.game-wrapper';

var joinGameColorPicker = '.join-game-wrapper .color-picker div';
var joinGameWrapper = '.join-game-wrapper';

var mainMenuWrapper = '.main-menu-wrapper';

var relicWrapper = '.canvas .relic-wrapper';
var settingsWrapper = '.settings-wrapper';




$(document).ready(function () {

  $(window).on('load', function() {
    currentUrl = window.location.href;

    // PUT YOUR STUFF HERE
    if (currentUrl.includes('games')) {

    }
  });

  $(window).on('unload', function() {
    gameService.disconnect(gameService.id, playerInfo.id);
  });

  $(backButton).click(function () {
    gameService.disconnect(gameService.id, playerInfo.id);

    resetGameRoom();
    switchToMainMenu();

    // removes the back button and any associated classes
    $(backButton).addClass("display-none");
    $(backButton).removeClass("back-create-game back-game back-join-game back-settings");
  });

  $(exitButton).click(function () {
    gameService.disconnect(gameService.id, playerInfo.id);

    resetGameRoom();
    switchToMainMenu();
  });


  // This can be made into a function !!!

  // Checks canvas aspect ratio on resize
  // If player is trying to cheat, this blocks the screen
  $(window).on('resize', function () {    
      let canvasWidth = $(".canvas").width();
      let canvasHeight = $(".canvas").height();

      $(relicWrapper).css("width", canvasWidth);
      $(relicWrapper).css("height", canvasHeight);

      if ($(".canvas").hasClass("status-ready")) {

      if (canvasWidth / canvasHeight < 1.1 || canvasHeight / canvasWidth < 0.55) {
        $(cheaterScrim).removeClass("display-none");
      } else if (canvasWidth / canvasHeight > 1.1 || canvasHeight / canvasWidth > 0.55) {
        $(cheaterScrim).addClass("display-none");
      }
    }
  });


  // Detects when mouse is in the "Ready" rectangle
  $(canvasReadyButton).mouseenter(function () {
    gameService.readyCheck(gameService.id, playerInfo.id)
  });


  // Detects when mouse leaves the "Ready" rectangle
  $(canvasReadyButton).mouseleave(function () {
    gameService.unReadyCheck(gameService.id, playerInfo.id)
  });


  $(chatSendButton).click(function() {
    sendGameMessage()
  });

  $(chatBox).keypress(function (event) {
    if (event.keyCode == 13) { sendGameMessage(); }
  });

  $(createGameColorPicker).click(function () {
    // Highlight the selected color
    $(createGameColorPicker).removeClass("selected");
    $(this).addClass("selected");

    let colorClass = $(this).attr("id");

    let color = `color-${colorClass}`;
    playerService.updateColor(color);
  });

  // Click on the menu button "Create Game"
  $(createGameMenuButton).click(function () {
    let valid = validatePlayerName();

    if (valid) {

      if ($('.create-game-session-info input').val().length <= 0) {
        $.post('/games', function (data) {
          $('.create-game-session-info input').val(data.gameId);
        });
      }

      switchToCreateGameMenu();

      $(".main-menu-wrapper span").css("opacity", "0");
    } else {
      $(".main-menu-wrapper span").css("opacity", "1");
    }
  });


  $('.field input').on('focus', function () {
    var selection = $(this)
      .one('mouseup.mouseupSelect', function () {
        selection.select();
        return false;
      })
      .one('mousedown', function () {
        $(this).off('mouseup.mouseupSelect');
      })
      .select();
  });


  $(gameSquare).click(function () {
    gameService.score(gameService.id, playerInfo.color, playerInfo.id, playerInfo.name);
  });


  // When in the join menu, click the join button
  $("#join-game").click(function () {

    let valid = validateSessionId('.join-game-session-info');

    if (!valid) {
      console.warn('Please enter a valid session ID');
      return;
    }

    // Connect to the associated session
    gameService.connect();
    gameService.joinRoom(gameService.id);
    gameService.addPlayer(gameService.id, playerInfo.id, playerInfo.name, playerInfo.color);

    switchToGameBoard();

    // Resizes the relic wrapper to fit in the canvas
    let canvasWidth = $(".canvas").width();
    let canvasHeight = $(".canvas").height();

    $(relicWrapper).css("width", canvasWidth);
    $(relicWrapper).css("height", canvasHeight);
    $(".relic-name").remove();

    let sessionName = $('.join-game-session-info input').val();
    $('.game-wrapper .title h2').text(sessionName);

    // removes the back button
    $(backButton).addClass("display-none");

    // Scrolls the chatlist to the most recent message
    $(".chat .messages").scrollTop(9999999999);
  });


  // Click on the menu button "Join Game"
  $("#join-game-menu").click(function () {
    let valid = validatePlayerName();

    if (valid) {
      switchToJoinGameMenu();
      $(".main-menu-wrapper span").css("opacity", "0");
    } else {
      $(".main-menu-wrapper span").css("opacity", "1");
    }
  });


  $(joinGameColorPicker).click(function () {
    // Highlight the selected color
    $(joinGameColorPicker).removeClass("selected");
    $(this).addClass("selected");

    let colorClass = $(this).attr("id");

    let color = `color-${colorClass}`;
    playerService.updateColor(color);
  });


  // Click on the menu button "Settings"
  $("#settings-menu").click(function() {
    switchToSettingsMenu()
  });


  // When in the create menu, click the start button
  $("#start-game").click(function () {

    let valid = validateSessionId('.create-game-session-info');

    if (!valid) {
      // display error message here
      console.warn('Please enter a valid session ID');
      return;
    }

    let maxPlayers = $('.create-game-wrapper .number-input input').val();

    gameService.connect();
    gameService.createGame(gameService.id, maxPlayers);
    gameService.joinRoom(gameService.id);
    gameService.addPlayer(gameService.id, playerInfo.id, playerInfo.name, playerInfo.color);

    switchToGameBoard();

    // Resizes the relic wrapper to fit in the canvas
    let canvasWidth = $(canvas).width();
    let canvasHeight = $(canvas).height();

    $(canvas).addClass("status-ready");
    $(relicWrapper).css("width", canvasWidth);
    $(relicWrapper).css("height", canvasHeight);
    $(".relic-name").remove();

    let sessionName = $('.create-game-session-info input').val();
    $('.game-wrapper .title h2').text(sessionName);
  });
});

function resetGameBoard() {
  $(gameSquare).addClass("display-none");
  $(".relic-square").remove();
  $(".relic-name").remove();
}

function resetGameRoom() {
  $(gameSquare).addClass("display-none");
  $(".relic-name").remove();
  $(".round-leaderboard").remove();
  $('.sidebar .scoreboard .player').remove();
  $('.chat .player-message').remove();
  $('.chat .starter-message').removeClass('display-none');
  $(canvas).removeClass("status-ready");
  $(".relic-wrapper div").remove();
}

function roundWon(playerColor, playerName, playerList) {
  $(canvas).prepend(`<div class="round-leaderboard ${playerColor}"><div class="winner-container"><div class="confetti"></div><div class="chip">${playerName}</div><div class="winner-text">is the winner!</div></div><div class="players-container"></div><div class="play-again-button"><div>Click to ready up</div></div></div>`);
  playerList.forEach(function(player){
    $(`${canvas} .players-container`).append(`<div class="player ${player.color}"><div class="name">${player.name}</div><div class="points"><span>${player.roundWins}</span>wins</div></div>`);
  });
  resetGameBoard();

  $(".play-again-button").click(function () {
    gameService.readyCheck(gameService.id, playerInfo.id);
  });

}

function sendGameMessage() {
  let messageString = $(chatBox).val();
  if (messageString.length < 1) { return; }

  gameService.sendMessage(gameService.id, playerInfo.color, playerInfo.id, playerInfo.name, messageString);

  $(".chat .starter-message").addClass("display-none");
  $(chatBox).val('');
  $(chatBox).focus();
}

function switchToMainMenu() {
  $(mainMenuWrapper).removeClass("display-none");

  $(createGameWrapper).addClass("display-none");
  $(gameWrapper).addClass("display-none");
  $(joinGameWrapper).addClass("display-none");
  $(settingsWrapper).addClass("display-none");
}

function switchToJoinGameMenu() {
  $(joinGameWrapper).removeClass("display-none");

  $(createGameWrapper).addClass("display-none");
  $(gameWrapper).addClass("display-none");
  $(mainMenuWrapper).addClass("display-none");
  $(settingsWrapper).addClass("display-none");

  $(backButton).removeClass("display-none");
  $(backButton).addClass("back-join-game");
}

function switchToSettingsMenu() {
  $(settingsWrapper).removeClass("display-none");

  $(createGameWrapper).addClass("display-none");
  $(gameWrapper).addClass("display-none");
  $(joinGameWrapper).addClass("display-none");
  $(mainMenuWrapper).addClass("display-none");

  $(backButton).removeClass("display-none");
  $(backButton).addClass("back-create-game");
}

function switchToCreateGameMenu() {
  $(createGameWrapper).removeClass("display-none");

  $(gameWrapper).addClass("display-none");
  $(joinGameWrapper).addClass("display-none");
  $(mainMenuWrapper).addClass("display-none");
  $(settingsWrapper).addClass("display-none");

  $(backButton).removeClass("display-none");
  $(backButton).addClass("back-create-game");
}

function switchToGameBoard() {
  $(gameWrapper).removeClass("display-none");
  
  $(createGameWrapper).addClass("display-none");
  $(joinGameWrapper).addClass("display-none");
  $(mainMenuWrapper).addClass("display-none");
  $(settingsWrapper).addClass("display-none");

  $(backButton).addClass("display-none");
}

function validatePlayerName() {
  let playerName = $('.main-menu-wrapper input').val();

  if (playerName.length > 2) {
    playerService.updateName(playerName);
    return true;
  }
  return false;
}

function validateSessionId(page) {
  let sessionId = $(`${page} input`).val();

  if (sessionId.length > 2) {
    gameService.updateGameId(sessionId.toUpperCase());
    return true;
  }
  return false;
}
