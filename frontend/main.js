// press enter for chat
// refocus input after message
// change min name 3 characters

var isOnDiv = false;

var backButton = '.back-button';

var canvas = '.canvas .ready';
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
  $(canvas).mouseenter(function () {
    isOnDiv = true;
    gameService.readyCheck(gameService.id, playerInfo.id)
  });


  // Detects when mouse leaves the "Ready" rectangle
  $(canvas).mouseleave(function () {
    isOnDiv = false;
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

  let string = $(".main-menu-wrapper input").val();

  if (string.length > 2) {

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
  let string = $(".main-menu-wrapper input").val();

  if (string.length > 2) {
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
