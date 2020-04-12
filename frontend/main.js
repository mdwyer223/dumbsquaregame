$(document).ready(function () {
    
    $(".back-button").click(function () {
        
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

        $(".join-game-wrapper").addClass("display-none");
        $(".game-wrapper").removeClass("display-none");
        
        $(".back-button").addClass("back-game");
        $(".back-button").removeClass("back-create-game");
        $(".back-button").removeClass("back-join-game");
        
        $(".back-button").text("exit");
    });
    
    
    
    
    
    
//    $(".nav-button-container > div").click(function () {
//
//        var button1Text = $("#button1").html();
//        var button2Text = $("#button2").html();
//        var button3Text = $("#button3").html();
//        var button4Text = $("#button4").html();
//        var button5Text = $("#button5").html();
//        var button6Text = $("#button6").html();
//
//        var navButtonClass = $(this).attr("class");
//
//        if ($(".case-study").hasClass("page-displayed")) {
//
//            var str1 = $(this).attr("class");
//            var str2 = "active-button";
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