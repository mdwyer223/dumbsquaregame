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

  // Click on the menu button "Create Game"
  
  $("#create-game-menu").click(function () {

    // Open creation menu
    
    $(".create-game-wrapper").removeClass("display-none");
    $(".main-menu-wrapper").addClass("display-none");

    // Add the back button
    
    $(".back-button").removeClass("display-none");
    $(".back-button").addClass("back-create-game");

  });

  $(".difficulty div").click(function () {
    
    // Highlight the selected difficulty
    
    $(".difficulty div").removeClass("selected");
    $(this).addClass("selected");

  });
  
  // Click on the menu button "Join Game"

  $("#join-game-menu").click(function () {

    // Open join menu
    
    $(".join-game-wrapper").removeClass("display-none");
    $(".main-menu-wrapper").addClass("display-none");

    // Add the back button
    
    $(".back-button").removeClass("display-none");
    $(".back-button").addClass("back-join-game");

  });

  // Click on the menu button "Join Game"
  
  $(".create-game-wrapper .color-picker div").click(function () {

    // Highlight the selected color
    
    $(".create-game-wrapper .color-picker div").removeClass("selected");
    $(this).addClass("selected");

  });
  
  // Click on the menu button "Join Game"

  $(".join-game-wrapper .color-picker div").click(function () {

    // Highlight the selected color
    
    $(".join-game-wrapper .color-picker div").removeClass("selected");
    $(this).addClass("selected");

  });
  
  // Click on the menu button "Settings"

  $("#settings-menu").click(function () {

    // Open the settings
    
    $(".settings-wrapper").removeClass("display-none");
    $(".main-menu-wrapper").addClass("display-none");

    // Add the back button
    
    $(".back-button").removeClass("display-none");
    $(".back-button").addClass("back-settings");

  });
  
  // When in the create menu, click the start button

  $("#start-game").click(function () {
    
    // Opens the game board

    $(".create-game-wrapper").addClass("display-none");
    $(".game-wrapper").removeClass("display-none");

    // Modifies the back button to be an "exit" button
    
    $(".back-button").addClass("back-game");
    $(".back-button").removeClass("back-create-game");
    $(".back-button").removeClass("back-join-game");

    $(".back-button").text("exit");
    
  });

  // When in the join menu, click the join button
  
  $("#join-game").click(function () {

    // Connect to the associated session
    
    gameService.connect(gameId);
    gameService.createGame();
    gameService.addPlayer(playerInfo.id);

    // Opens the game board
    
    $(".join-game-wrapper").addClass("display-none");
    $(".game-wrapper").removeClass("display-none");

    // Modifies the back button to be an "exit" button
    
    $(".back-button").addClass("back-game");
    $(".back-button").removeClass("back-create-game");
    $(".back-button").removeClass("back-join-game");

    $(".back-button").text("exit");
    
    // Scrolls the chatlist to the most recent message
    // This isn't necessary for a new game because the chatlist will be empty
    // Sending a new message also scrolls the chatlist

    $(".chat .messages").scrollTop(9999999999);

  });

  // Clicking the game square
  
  $(".matt-square").click(function () {

    // Determine how many points you currently have
    
    let string = $(".color-green .points span").text();
    let points = parseInt(string);

    // Send the User ID, Name and current points
    
    gameService.score('fakeid', 'matt', points);
    
    // Score is updated server-side

  });

  // Clicking the message "Send" button
  
  $(".chat .send-button").click(function () {

    // Record what the player typed
    
    let messageString = $(".chat input").val();
    
    if (messageString.length > 0) {

      // Send to the server the User ID, Player name and message string
      
      gameService.sendMessage('fakeid', playerInfo, messageString);
      
      // Reset the input to be empty
      
      $(".chat input").val("");

    }

  });
  
  // Set a variable to detect mouse position
  
  var isOnDiv = false;

  // Detects when mouse is in the "Ready" rectangle
  
  $(".canvas .ready").mouseenter(function () {
    isOnDiv = true;
    gameService.readyCheck(gameId, playerInfo.id)
  });

  // Detects when mouse leaves the "Ready" rectangle
  
  $(".canvas .ready").mouseleave(function () {
    isOnDiv = false;
    gameService.unReadyCheck(gameId, playerInfo.id)
  });

  // When player hover the "Ready" rectangle
  
  $(".canvas .ready").hover(function () {
    
    // We start a timer for 3 seconds
    // We count down from 399 to 100
    // and only take the first digit
    // so that the user only ever sees "3..2..1.." and never 0

    let time = 350;
    
    // The interval actually counts down one unit every 10ms
    // This smooths out the transition between the 
    // "Hover here" string and the "3..2..1.." strings
    // If we didn't do this it's a lil janky

    let interval = setInterval(function () {
      
      // If timer has time left AND mouse is in the rectangle
      
      if (time > 100 && isOnDiv === true) {

        // Grab the time left and convert it to seconds
        
        let num = time.toString();
        let firstNum = num.charAt(0);
        
        // Comment this in, and comment line 247, shows actual timer
        // $(".canvas .ready div").text(num);
        
        // Change text to show # of seconds remaining
        
        $(".canvas .ready div").text(firstNum);
        
        // Count down, and restart the loop
        time = time - 1;

      } 
      
      // If timer has time left AND mouse is NOT in rectangle
      
      else if (time > 100 && isOnDiv === false) {

        // Reset the text andd clear the timer
        
        $(".canvas .ready div").text("Hold mouse here to start");
        clearInterval(interval);

      } 
      
      // When the timer is done
      
      else {
        
        // Remove the "Ready" rectangle and add the game square
        
        $(".canvas .ready").addClass("display-none");
        $(".canvas .square").removeClass("display-none");
        
        // give a random # between -50 and +50
    
        let rand1 = (Math.floor(Math.random() * 100) - 50);
        let rand2 = (Math.floor(Math.random() * 100) - 50);
        
        // Set variable that signals whether the random # is negative or positive
        
        let negOrPos1 = "+";
        let negOrPos2 = "+";
        
        let windowWidth = $(window).width();
        let windowHeight = $(window).width();
        
        let rectangleSize = ((0.03 * windowWidth) + (0.04 * windowHeight));
        
        if (rand1 > 40) {
          
          // If the random # is very positive
          // Subtract 52px to make sure the rectangle
          // does not position off screen
          negOrPos1 = "- 52px";
          
        } else if (rand1 < -40) {
          
          // If the random # is very negative
          // Add 52px to make sure the rectangle
          // does not position off screen
          negOrPos1 = "+ 52px";
          
        } else {
          
          // If the random # is neutral then we don't reposition
          negOrPos1 = "+ 0px";
          
        }
        
        if (rand2 > 40) {
          
          // If the random # is very positive
          // Subtract 52px to make sure the rectangle
          // does not position off screen
          negOrPos2 = "- 52px";
          
        } else if (rand2 < -40) {
          
          // If the random # is very negative
          // Add 52px to make sure the rectangle
          // does not position off screen
          negOrPos2 = "+ 52px";
          
        } else {
          
          // If the random # is neutral then we don't reposition
          negOrPos2 = "+ 0px";
          
        }
        
        // Take the random number and the positive or negative compensation
        // This dictates the final X and Y position of the square
        
        let fullString1 = "calc(" + rand1 + "% " + negOrPos1 + ")";
        let fullString2 = "calc(" + rand2 + "% " + negOrPos2 + ")";
        
        // Log to track all the variables above
        
        console.log(rand1);
        console.log(rand2);
        console.log(negOrPos1);
        console.log(negOrPos2);
        console.log(fullString1);
        console.log(fullString2);
        
        // Set the CSS to randomly position the square
        
        $(".canvas .square").css("top", fullString1);
        $(".canvas .square").css("left", fullString2);
        
        // Clear the timer
        
        clearInterval(interval);

      }
    }, 10);
  });
  
  // Clicking the game square
  
  $(".canvas .square").click(function () {

    // Determine how many points you currently have
    
    let winnersPoints = $(".color-green .points span").text();
    let pointsString = parseInt(winnersPoints);

    // Send the User ID, Name and current points
    
    // !!! Uncomment this 
    gameService.score('fakeid', playerInfo.id, winnersPoints);
    
    // Add message to show which player scored
    // "X scores +1 to make it match point"
    // "Y won the round and takes the lead" etc etc
    
    // Reset the game board
    
    $(".canvas .ready").removeClass("display-none");
    $(".canvas .square").addClass("display-none");

  });
});
