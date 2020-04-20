$(document).ready(function () {

  $(".back-button").click(function () {

    console.log('Disconnecting from game service...');
    gameService.disconnect();

    $(".main-menu-wrapper").removeClass("display-none");
    $(".create-game-wrapper").addClass("display-none");
    $(".join-game-wrapper").addClass("display-none");
    $(".settings-wrapper").addClass("display-none");
    $(".game-wrapper").addClass("display-none");

    $(".back-button").addClass("display-none");
    $(".back-button").removeClass("back-create-game");
    $(".back-button").removeClass("back-join-game");
    $(".back-button").removeClass("back-settings");
    $(".back-button").removeClass("back-game");

    $(".back-button").text("back");

  });

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

  $(".jason-square").click(function () {

    let string = $(".color-red .points span").text();
    let points = parseInt(string);

    // points++;

    console.log(points);

    gameService.score('fakeid', 'jason', points);

    // $(".color-red .points span").text(points);

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

      gameService.sendMessage("fakeId", "matt", messageString)
      $(".chat input").val("");

    }

    console.log(messageString);

  });


  //    $(".nav-button-container > div").click(function () {
  //
  //        let button1Text = $("#button1").html();
  //        let button2Text = $("#button2").html();
  //        let button3Text = $("#button3").html();
  //        let button4Text = $("#button4").html();
  //        let button5Text = $("#button5").html();
  //        let button6Text = $("#button6").html();
  //
  //        let navButtonClass = $(this).attr("class");
  //
  //        if ($(".case-study").hasClass("page-displayed")) {
  //
  //            let str1 = $(this).attr("class");
  //            let str2 = "active-button";
  //
  //    $(".nav-back-container .x").click(function () {
  //
  //        // removes nav
  //
  //        $(".navigation").removeClass("navigation-displayed");
  //
  //        if ($(".case-study").hasClass("page-displayed")) {
  //
  //            $.scrollify.disable();
  //
  //        } else {
  //
  //            $.scrollify.disable();
  //
  //        }
  //
  //    });
  //    });


});