// 
// 
// I'm in the middle of commenting through everything

$(document).ready(function () {

  $(".back-button").click(function () {

    // clicking the back button disconnects from the session
    
    console.log('Disconnecting from game service...');
    gameService.disconnect();
    
    // brings the page back to the main menu

    $(".main-menu-wrapper").removeClass("display-none");
    $(".create-game-wrapper").addClass("display-none");
    $(".join-game-wrapper").addClass("display-none");
    $(".settings-wrapper").addClass("display-none");
    $(".game-wrapper").addClass("display-none");

    // removes the back button and any associated classes
    
    $(".back-button").addClass("display-none");
    $(".back-button").removeClass("back-create-game");
    $(".back-button").removeClass("back-join-game");
    $(".back-button").removeClass("back-settings");
    $(".back-button").removeClass("back-game");

    // In game the button says "exit", so we're reverting it here
    
    $(".back-button").text("back");

  });

  // In game the button says "exit", so we're reverting it here
  
  $("#create-game-menu").click(function () {

    $(".create-game-wrapper").removeClass("display-none");
    $(".main-menu-wrapper").addClass("display-none");

    $(".back-button").removeClass("display-none");
    $(".back-button").addClass("back-create-game");

  });

  $(".difficulty div").click(function () {

    $(".difficulty div").removeClass("selected");
    $(this).addClass("selected");

  });

  $("#join-game-menu").click(function () {

    $(".join-game-wrapper").removeClass("display-none");
    $(".main-menu-wrapper").addClass("display-none");

    $(".back-button").removeClass("display-none");
    $(".back-button").addClass("back-join-game");

  });

  $(".create-game-wrapper .color-picker div").click(function () {

    $(".create-game-wrapper .color-picker div").removeClass("selected");
    $(this).addClass("selected");

  });

  $(".join-game-wrapper .color-picker div").click(function () {

    $(".join-game-wrapper .color-picker div").removeClass("selected");
    $(this).addClass("selected");

  });

  $("#settings-menu").click(function () {

    $(".settings-wrapper").removeClass("display-none");
    $(".main-menu-wrapper").addClass("display-none");

    $(".back-button").removeClass("display-none");
    $(".back-button").addClass("back-settings");

  });

  $("#start-game").click(function () {

    $(".create-game-wrapper").addClass("display-none");
    $(".game-wrapper").removeClass("display-none");

    $(".back-button").addClass("back-game");
    $(".back-button").removeClass("back-create-game");
    $(".back-button").removeClass("back-join-game");

    $(".back-button").text("exit");
  });

  $("#join-game").click(function () {

    gameService.connect('fakeid');

    $(".join-game-wrapper").addClass("display-none");
    $(".game-wrapper").removeClass("display-none");

    $(".back-button").addClass("back-game");
    $(".back-button").removeClass("back-create-game");
    $(".back-button").removeClass("back-join-game");

    $(".back-button").text("exit");

    $(".chat .messages").scrollTop(9999999999);

  });

  $(".matt-square").click(function () {

    let string = $(".color-green .points span").text();
    let points = parseInt(string);

    // points++;

    console.log(points);

    gameService.score('fakeid', 'matt', points);

    // $(".color-green .points span").text(points);

  });

  $(".chat .send-button").click(function () {

    let messageString = $(".chat input").val();

    if (messageString.length > 0) {

      gameService.sendMessage('fakeid', playerInfo, messageString);
      $(".chat input").val("");

    }

  });

  var isOnDiv = false;

  $(".canvas .ready").mouseenter(function () {
    isOnDiv = true;
  });

  $(".canvas .ready").mouseleave(function () {
    isOnDiv = false;
  });


  $(".canvas .ready").hover(function () {

    let time = 399;

    let interval = setInterval(function () {
      if (time > 100 && isOnDiv === true) {

        let num = time.toString();
        let firstNum = num.charAt(0);
        
        $(".canvas .ready div").text(firstNum);
        time = time - 1;

      } else if (time > 100 && isOnDiv === false) {

        $(".canvas .ready div").text("Hold mouse here to start");
        clearInterval(interval);

      } else {
        
        $(".canvas .ready").addClass("display-none");
        $(".canvas .square").removeClass("display-none");
    
        let rand1 = (Math.floor(Math.random() * 100) - 50);
        let rand2 = (Math.floor(Math.random() * 100) - 50);
        
        let negOrPos1 = "+"; 
        let negOrPos2 = "+";
        
        if (rand1 > 40) {
          
          negOrPos1 = "- 52px";
          
        } else if (rand1 < -40) {
          
          negOrPos1 = "+ 52px";
          
        } else {
          
          negOrPos1 = "+ 0px";
          
        }
        
        if (rand2 > 40) {
          
          negOrPos2 = "- 52px";
          
        } else if (rand2 < -40) {
          
          negOrPos2 = "+ 52px";
          
        } else {
          
          negOrPos2 = "+ 0px";
          
        }
        
        let fullString1 = "calc(" + rand1 + "% " + negOrPos1 + ")";
        let fullString2 = "calc(" + rand2 + "% " + negOrPos2 + ")";
        
        console.log(rand1);
        console.log(rand2);
        console.log(negOrPos1);
        console.log(negOrPos2);
        console.log(fullString1);
        console.log(fullString2);
        
        $(".canvas .square").css("top", fullString1);
        $(".canvas .square").css("left", fullString2);
        
        clearInterval(interval);

      }
    }, 10);
  });









});
