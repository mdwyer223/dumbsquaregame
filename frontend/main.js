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

var feedbackContainer = '.feedback-container';
var feedbackClose = '.feedback-close';
var feedbackOpen = '.feedback-open';
var feedbackSubmit = '.feedback-submit';

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


  $(".chat-button").click(function () {
    openChat();
  });


  $("body").delegate(".chat-exit", "click", function(){
    closeChat();
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


  $(feedbackOpen).click(function () {
    openFeedback();
  });


  $("body").delegate(feedbackClose, "click", function(){
    closeFeedback();
  });
  

  $("body").delegate(feedbackSubmit, "click", function(){

    var nameVal = $(".feedback-name").val();
    var messageVal = $(".feedback-message").val();

    if (nameVal.length == 0 && messageVal.length == 0) {
      $(".feedback-warning").remove();
      $(".feedback-message").after("<div class='feedback-warning' style='margin-bottom: 24px;'>Name and message are required</p>");
      $(".feedback-name").css("border-bottom", "4px solid var(--player-color-1)");
      $(".feedback-message").css("border-bottom", "4px solid var(--player-color-1)");
    } else if (nameVal.length > 0 && messageVal.length == 0) {
      $(".feedback-warning").remove();
      $(".feedback-message").after("<div class='feedback-warning' style='margin-bottom: 24px;'>Message is required</p>");
      $(".feedback-message").css("border-bottom", "4px solid var(--player-color-1)");
    } else if (nameVal.length == 0 && messageVal.length > 0) {
      $(".feedback-warning").remove();
      $(".feedback-message").after("<div class='feedback-warning' style='margin-bottom: 24px;'>Name is required</p>");
      $(".feedback-name").css("border-bottom", "4px solid var(--player-color-1)");
    } else if (nameVal.length > 0 && messageVal.length > 0) {
      submitFeedback();
      feedbackConfirmed();
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
  // $("#settings-menu").click(function() {
  //   switchToSettingsMenu()
  // });


  // When in the create menu, click the start button
  $("#start-game").click(function () {

    let valid = validateSessionId('.create-game-session-info');

    if (!valid) {
      // display error message here
      console.warn('Please enter a valid session ID');
      return;
    }

    let maxPlayers = parseInt($('.create-game-wrapper .players-input input').val());
    let maxPoints = parseInt($('.create-game-wrapper .points-input input').val());

    gameService.connect();
    gameService.createGame(gameService.id, maxPlayers, maxPoints);
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

function openFeedback() {
  $("body").prepend(`<div class="feedback-container"><div class="feedback-dialog"><h2>Send us some feedback!</h2><input type="text" class="feedback-name" placeholder="Name" onblur="this.placeholder='Name'" onfocus="this.placeholder=''"><textarea class="feedback-message" placeholder="Message" onblur="this.placeholder='Message'" onfocus="this.placeholder=''"></textarea><div class="feedback-button-container"><div class="feedback-submit">Submit</div><div class="feedback-close">Cancel</div></div></div></div>`);
  $("html").addClass("no-scroll");
}

function feedbackConfirmed() {
  $("body").prepend(`<div class="feedback-toast">Feedback submitted!</div>`);
  setTimeout(function(){ 
    $(".feedback-toast").remove();
  }, 2800);
}

function closeFeedback() {
  $(feedbackContainer).remove();
  $("html").removeClass("no-scroll");
}

function closeChat() {
  $(".chat-scrim").remove();
  $(".chat").removeClass("mobile-chat");
}

function openChat() {
  $("body").prepend("<div class='chat-scrim'><div class='chat-exit transition-01s'><div class='icon'></div><div class='text'>Close</div></div></div>");
  $(".chat").addClass("mobile-chat");
}

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

  let chipWidth = $(".round-leaderboard .chip").width();
  let winnerColor = playerColor.substring(6);
  
  if (chipWidth < 21) {
    $(".round-leaderboard .winner-container").css("background-image", "none");
    $(".round-leaderboard .winner-container").css("background-size", "500px 120px");
  } else if (chipWidth >= 21 && chipWidth < 77) {
    $(".round-leaderboard .winner-container").css("background-image", "url('style/confetti-" + winnerColor + "-1.png')");
  } else if (chipWidth >= 77 && chipWidth < 119) {
    $(".round-leaderboard .winner-container").css("background-image", "url('style/confetti-" + winnerColor + "-2.png')");
  } else if (chipWidth >= 119 && chipWidth < 175) {
    $(".round-leaderboard .winner-container").css("background-image", "url('style/confetti-" + winnerColor + "-3.png')");
  } else if (chipWidth >= 175 && chipWidth < 239) {
    $(".round-leaderboard .winner-container").css("background-image", "url('style/confetti-" + winnerColor + "-4.png')");
  } else if (chipWidth >= 239 && chipWidth < 281) {
    $(".round-leaderboard .winner-container").css("background-image", "url('style/confetti-" + winnerColor + "-5.png')");
  } else if (chipWidth >= 281 && chipWidth < 338) {
    $(".round-leaderboard .winner-container").css("background-image", "url('style/confetti-" + winnerColor + "-6.png')");
  } else if (chipWidth >= 338) {
    $(".round-leaderboard .winner-container").css("background-image", "none");
    $(".round-leaderboard .winner-container").css("background-size", "500px 120px");
  }

  if ((chipWidth >= 21 && chipWidth < 33) || (chipWidth >= 77 && chipWidth < 81) || (chipWidth >= 119 && chipWidth < 130) || (chipWidth >= 175 && chipWidth < 193) || (chipWidth >= 239 && chipWidth < 247) || (chipWidth >= 281 && chipWidth < 292)) {
    $(".round-leaderboard .winner-container").css("background-size", "460px 120px");
  } else if ((chipWidth >= 33 && chipWidth < 45) || (chipWidth >= 81 && chipWidth < 85) || (chipWidth >= 130 && chipWidth < 142) || (chipWidth >= 190 && chipWidth < 205) || (chipWidth >= 245 && chipWidth < 250) || (chipWidth >= 289 && chipWidth < 297)) {
    $(".round-leaderboard .winner-container").css("background-size", "480px 120px");
  } else if ((chipWidth >= 45 && chipWidth < 55) || (chipWidth >= 85 && chipWidth < 95) || (chipWidth >= 142 && chipWidth < 152) || (chipWidth >= 205 && chipWidth < 215) || (chipWidth >= 250 && chipWidth < 260) || (chipWidth >= 297 && chipWidth < 307)) {
    $(".round-leaderboard .winner-container").css("background-size", "500px 120px");
  } else if ((chipWidth >= 55 && chipWidth < 66) || (chipWidth >= 95 && chipWidth < 107) || (chipWidth >= 152 && chipWidth < 163) || (chipWidth >= 215 && chipWidth < 227) || (chipWidth >= 260 && chipWidth < 270) || (chipWidth >= 307 && chipWidth < 322)) {
    $(".round-leaderboard .winner-container").css("background-size", "520px 120px");
  } else if ((chipWidth >= 66 && chipWidth < 77) || (chipWidth >= 107 && chipWidth < 119) || (chipWidth >= 163 && chipWidth < 175) || (chipWidth >= 227 && chipWidth < 239) || (chipWidth >= 270 && chipWidth < 281) || (chipWidth >= 322 && chipWidth <= 338)) {
    $(".round-leaderboard .winner-container").css("background-size", "540px 120px");
  }

  $(".play-again-button").click(function () {
    gameService.readyCheck(gameService.id, playerInfo.id);
  });

}

function submitFeedback() {
  // send the email

  // close the window
  closeFeedback(); 

  // popup a message that says "feedback submitted"
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