var backButton = '.back-button';

var canvasReadyButton = '.canvas .ready';
var chatBox = '.chat input';
var chatSendButton = '.chat .send-button';
var createGameColorPicker = '.create-game-wrapper .color-picker div';
var createGameWrapper = '.create-game-wrapper';

var gameSquare = '.canvas .square';
var gameWrapper = '.game-wrapper';

var joinGameColorPicker = '.join-game-wrapper .color-picker div';
var joinGameWrapper = '.join-game-wrapper';

var mainMenuWrapper = '.main-menu-wrapper';

var settingsWrapper = '.settings-wrapper';


$(document).ready(function () {
  $(backButton).click(function () {
    gameService.disconnect(gameService.id, playerInfo.id);

    resetGameRoom();

    // brings the page back to the main menu
    $(mainMenuWrapper).removeClass("display-none");
    $(createGameWrapper).addClass("display-none");
    $(joinGameWrapper).addClass("display-none");
    $(settingsWrapper).addClass("display-none");
    $(gameWrapper).addClass("display-none");

    // removes the back button and any associated classes
    $(backButton).addClass("display-none");
    $(backButton).removeClass("back-create-game back-game back-join-game back-settings");

    // In game the button says "exit", so we're reverting the text here
    $(backButton).text("back");
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

    console.log(this);

    let colorClass = $(this).attr("id");

    console.log(colorClass);

    let color = `color-${colorClass}`;
    playerService.updateColor(color);
  });


// Click on the menu button "Create Game"
$("#create-game-menu").click(function () {
  let valid = validatePlayerName();

  if(valid) {

    if ($('.create-game-session-info input').val().length <= 0) {
      $.get('/games', function(data) {
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


  // Click on the difficulty button
  $(".difficulty div").click(function () {

    // Highlight the selected difficulty
    $(".difficulty div").removeClass("selected");
    $(this).addClass("selected");
  });


  $(gameSquare).click(function () {
    // Determine how many points you currently have
    let winnersPoints = $(`#${playerInfo.id}`).text();
    let pointsString = parseInt(winnersPoints);

    gameService.score(gameService.id, playerInfo.id, winnersPoints);

    // Reset the game board
    $(canvas).removeClass("display-none");
    $(gameSquare).addClass("display-none");

  });


  // When in the join menu, click the join button
  $("#join-game").click(function () {

  let valid = validateSessionId('.join-game-session-info');

  if(!valid) {
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

    // Modifies the back button to be an "exit" button
    $(backButton).addClass("back-game");
    $(backButton).removeClass("back-create-game back-join-game");

    $(backButton).text("exit");

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

    console.log(this);

    let colorClass = $(this).attr("id");

    console.log(colorClass);

    let color = `color-${colorClass}`;
    playerService.updateColor(color);
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

    // Modifies the back button to be an "exit" button
    $(backButton).addClass("back-game");
    $(backButton).removeClass("back-create-game back-join-game");

  $(backButton).text("exit");
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
