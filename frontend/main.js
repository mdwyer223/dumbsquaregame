var backButton = '.back-button';

var canvas = '.canvas';
var canvasReadyButton = '.canvas .ready';
var chatBox = '.chat input';
var chatSendButton = '.chat .send-button';
var cheaterScrim = '.cheater-scrim';
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
  $(backButton).click(function () {

    // brings the page back to the main menu
    $(mainMenuWrapper).removeClass("display-none");
    $(createGameWrapper).addClass("display-none");
    $(joinGameWrapper).addClass("display-none");
    $(settingsWrapper).addClass("display-none");

    // removes the back button and any associated classes
    $(backButton).addClass("display-none");
    $(backButton).removeClass("back-create-game back-game back-join-game back-settings");
  });

  $(exitButton).click(function () {
    gameService.disconnect(gameService.id, playerInfo.id);

    resetGameRoom();

    // brings the page back to the main menu
    $(mainMenuWrapper).removeClass("display-none");
    $(gameWrapper).addClass("display-none");
    $(canvas).removeClass("status-ready");
    $(".relic-wrapper div").remove();
  });


  // This can be made into a function !!!

  // Checks canvas aspect ratio on resize
  // If player is trying to cheat, this blocks the screen
  $(window).on('resize', function () {
    if ($(".canvas").hasClass("status-ready")) {

      let canvasWidth = $(".canvas").width();
      let canvasHeight = $(".canvas").height();

      $(relicWrapper).css("width", canvasWidth);
      $(relicWrapper).css("height", canvasHeight);

      if (canvasWidth / canvasHeight < 1.1 || canvasHeight / canvasWidth < 0.55) {
        $(cheaterScrim).removeClass("display-none");
      } else if (canvasWidth / canvasHeight > 1.1 || canvasHeight / canvasWidth > 0.55) {
        $(cheaterScrim).addClass("display-none");
      }
    }
  });


  // Detects when mouse is in the "Ready" rectangle
  $(canvasReadyButton).mouseenter(function () {
    console.log('Mouse entered, sending ready check');
    gameService.readyCheck(gameService.id, playerInfo.id)
  });


  // Detects when mouse leaves the "Ready" rectangle
  $(canvasReadyButton).mouseleave(function () {
    console.log('Mouse left, sending unready check');
    gameService.unReadyCheck(gameService.id, playerInfo.id)
  });


  $(chatSendButton).click(function () {
    let messageString = $(chatBox).val();

    if (messageString.length > 0) {
      gameService.sendMessage(gameService.id, playerInfo.color, playerInfo.id, playerInfo.name, messageString);
      $(chatBox).val('');

      $(chatBox).focus();

      $(".chat .starter-message").addClass("display-none");
    }
  });

  $(chatBox).keypress(function (event) {
    let messageString = $(chatBox).val();

    if (event.keyCode == 13 && messageString.length > 0) {

      gameService.sendMessage(gameService.id, playerInfo.color, playerInfo.id, playerInfo.name, messageString);
      $(chatBox).val('');

      $(chatBox).focus();

      $(".chat .starter-message").addClass("display-none");
    }
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
  $("#create-game-menu").click(function () {
    let valid = validatePlayerName();

    if (valid) {

      if ($('.create-game-session-info input').val().length <= 0) {
        $.get('/games', function (data) {
          $('.create-game-session-info input').val(data.gameId);
        });
      }

      $(createGameWrapper).removeClass("display-none");
      $(mainMenuWrapper).addClass("display-none");

      $(backButton).removeClass("display-none");
      $(backButton).addClass("back-create-game");

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
        $this.off('mouseup.mouseupSelect');
      })
      .select();
  });

  
  $(gameSquare).click(function () {
    // Determine how many points you currently have
    let winnersPoints = $(`#${playerInfo.id} .points span`).text();
    console.log(winnersPoints);
    let points = parseInt(winnersPoints);

    gameService.score(gameService.id, playerInfo.color, playerInfo.id, points);
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

    // Opens the game board
    $(joinGameWrapper).addClass("display-none");
    $(gameWrapper).removeClass("display-none");
    $(canvas).addClass("status-ready");

    // This can be made into a function !!!

    // Resizes the relic wrapper to fit in the canvas
    let canvasWidth = $(".canvas").width();
    let canvasHeight = $(".canvas").height();

    $(relicWrapper).css("width", canvasWidth);
    $(relicWrapper).css("height", canvasHeight);

    let sessionName = $('.join-game-session-info input').val();
    $('.game-wrapper .title h3').text(sessionName);

    // removes the back button
    $(backButton).addClass("display-none");

    // Scrolls the chatlist to the most recent message
    $(".chat .messages").scrollTop(9999999999);

  });


  // Click on the menu button "Join Game"
  $("#join-game-menu").click(function () {
    let valid = validatePlayerName();

    if (valid) {
      $(joinGameWrapper).removeClass("display-none");
      $(mainMenuWrapper).addClass("display-none");

      // Add the back button
      $(backButton).removeClass("display-none");
      $(backButton).addClass("back-join-game");

      $(".main-menu-wrapper span").css("opacity", "0");

    } else {
      $(".main-menu-wrapper span").css("opacity", "1");
    }

  });


  // Click on the menu button "Join Game"
  $(joinGameColorPicker).click(function () {
    // Highlight the selected color
    $(joinGameColorPicker).removeClass("selected");
    $(this).addClass("selected");

    let colorClass = $(this).attr("id");

    let color = `color-${colorClass}`;
    playerService.updateColor(color);
  });
  
  
  // Click on a mode button
  $(".modes div").click(function () {

    // Highlight the selected mode
    $(".modes div").removeClass("selected");
    $(this).addClass("selected");
  });


  // Click on the menu button "Settings"
  $("#settings-menu").click(function () {

    // Open the settings
    $(settingsWrapper).removeClass("display-none");
    $(mainMenuWrapper).addClass("display-none");

    // Add the back button
    $(backButton).removeClass("display-none");
    $(backButton).addClass("back-settings");
  });


  // When in the create menu, click the start button
  $("#start-game").click(function () {

    let valid = validateSessionId('.create-game-session-info');

    if (!valid) {
      // display error message here
      console.warn('Please enter a valid session ID');
      return;
    }

    gameService.connect();
    gameService.createGame(gameService.id);
    gameService.joinRoom(gameService.id);
    gameService.addPlayer(gameService.id, playerInfo.id, playerInfo.name, playerInfo.color);

    // Opens the game board
    $(createGameWrapper).addClass("display-none");
    $(gameWrapper).removeClass("display-none");


    // This can be made into a function !!!

    // Resizes the relic wrapper to fit in the canvas
    let canvasWidth = $(canvas).width();
    let canvasHeight = $(canvas).height();

    $(canvas).addClass("status-ready");
    $(relicWrapper).css("width", canvasWidth);
    $(relicWrapper).css("height", canvasHeight);

    let sessionName = $('.create-game-session-info input').val();
    $('.game-wrapper .title h3').text(sessionName);

    // removes the back button
    $(backButton).addClass("display-none");
  });
});

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
    gameService.updateGameId(sessionId);
    return true;
  }

  return false;
}

function resetGameRoom() {
  $('.sidebar .scoreboard .player').remove();
  $('.chat .player-message').remove();
  $('.chat .starter-message').removeClass('display-none');
}
