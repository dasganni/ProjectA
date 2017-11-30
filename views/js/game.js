//declaration of all buttons

var shootButton = document.querySelector(".js-button-shoot");
var pistolButton = document.querySelector(".js-button-pistol");
var rifleButton = document.querySelector(".js-button-rifle");
var shotgunButton = document.querySelector(".js-button-shotgun");
var reloadButton = document.querySelector(".js-button-reload");
var protectButton = document.querySelector(".js-button-protect");
var readyButton = document.querySelector(".js-button-ready");
var leaveButton = document.querySelector(".js-button-leave");


//declaration of global variables

var chosenAction = false;
var attackTypeChosen = false;
var yourselfPlayer;
var enemies = [];
var gameIsStarted = false;

//initialize button status at the beginning

pistolButton.disabled = true;
shotgunButton.disabled = true;
rifleButton.disabled = true;
shootButton.disabled=true;
protectButton.disabled=true;
reloadButton.disabled=true;
readyButton.disabled=true
if (leaveButton != undefined) {
  leaveButton.disabled = true;
};


//add event listeners for readybutton with anonymous function
readyButton.addEventListener("click", function () {
  $(".js-button-ready").addClass("display-none");
 readyButton.disabled = true; //readybutton
 changeButtonStatus();
 readyButton.removeEventListener("click", this);
   
 socket.emit('readyClicked', {
   'username':username
 });  
});

//create event listeners for all buttons. if they are clicked, their event will be triggered, their action sent to server and the actions chosen counter raised 

shootButton.addEventListener("click", function (){buttonClicked(0)});

pistolButton.addEventListener("click", function (){buttonClicked(1)});   

rifleButton.addEventListener("click", function (){buttonClicked(2)});

shotgunButton.addEventListener("click", function (){buttonClicked(3)});

reloadButton.addEventListener("click", function (){buttonClicked(4)});

protectButton.addEventListener("click", function (){buttonClicked(5)});

if (leaveButton != undefined) {
leaveButton.addEventListener("click", function (){buttonClicked(6)});
}


//functions
// you have chosen your action
var actionChosen = function(yourselfplayername, chosenAction, chosenAttacktype ){
  pistolButton.disabled = true;
  shotgunButton.disabled = true;
  rifleButton.disabled = true;
  shootButton.disabled=true;
  protectButton.disabled=true;
  reloadButton.disabled=true;

  changeButtonStatus();
  
  socket.emit('setPlayerAction', {            //set your action
    'actionUsername': yourselfplayername, 
    'action':chosenAction, 
    'attacktype':chosenAttacktype
  });
  socket.emit('actionOnClientChosen', {       //add yourself to an array of players that have chosen their actions. If all have chosen the action, the server will start the next step
    'username': yourselfplayername 
  });
}


//check which button has been clicked and send the button actions to the function actionchosen above. Delete all buttoneventlisteners after this
var buttonClicked = function(buttonNumber){
  if(buttonNumber==0){//shootbutton
  }
  else if(buttonNumber==1){//pistolbutton
    chosenAction=0;
    chosenAttacktype=3;
    actionChosen(yourselfPlayer.name, chosenAction, chosenAttacktype);       
  }
  else if(buttonNumber==2){//riflebutton
    chosenAction=0;
    chosenAttacktype=2;
    actionChosen(yourselfPlayer.name, chosenAction, chosenAttacktype);    
  }
  else if(buttonNumber==3){//shotgunbutton
    chosenAction=0;
    chosenAttacktype=1;
    actionChosen(yourselfPlayer.name, chosenAction, chosenAttacktype);      
  }
  else if(buttonNumber==4){//reloadbutton
    chosenAction=1;
    chosenAttacktype=0;        
    actionChosen(yourselfPlayer.name, chosenAction, chosenAttacktype);         
  }
  else if(buttonNumber==5){//protectbutton
    chosenAction=2;
    chosenAttacktype=0;        
    actionChosen(yourselfPlayer.name, chosenAction, chosenAttacktype);    
  }
  else if(buttonNumber==6){//leavebutton
    window.location.href='/';
  }else{//should be never triggered
    console.log("Not existing Button clicked?!")
  }
}

//check the ammo and deactivate all not allowed buttons
var deactivateNotAllowedActionButtons = function(playerObject){

  pistolButton.disabled=true; 
  shotgunButton.disabled=true; 
  rifleButton.disabled=true;
  reloadButton.disabled=false;
  shootButton.disabled=false;
  protectButton.disabled=false;
  if (leaveButton != undefined) {
  leaveButton.disabled=true;
  }

  changeButtonStatus();

  //activate specific buttons

  if(playerObject.ammo >= 5){
    //activate all weapons
    pistolButton.disabled=false;
    shotgunButton.disabled=false;
    rifleButton.disabled=false;

    changeButtonStatus();

  } else if(playerObject.ammo <5 && playerObject.ammo >= 3){
    //activate rifle and pistol button
    pistolButton.disabled=false;
    shotgunButton.disabled=true;
    rifleButton.disabled=false;

    changeButtonStatus();

  } else if(playerObject.ammo > 0 && playerObject.ammo < 3){
    //activate only pistol button
    pistolButton.disabled=false;
    shotgunButton.disabled=true;
    rifleButton.disabled=true;

    changeButtonStatus();
    
  }
  
}


//check which buttons are enabled and which are disabled and change the style of the buttons configured in skeleton.css
var changeButtonStatus = function () {
  if (shootButton.disabled) {
    $(shootButton).addClass("disable-button");
    $(shootButton).removeClass("enable-button");    
  }else{
    $(shootButton).addClass("enable-button"); 
    $(shootButton).removeClass("disable-button");
    
  }

  if (pistolButton.disabled) {
    $(pistolButton).addClass("disable-button");
    $(pistolButton).removeClass("enable-button");    
    
  }else{
    $(pistolButton).addClass("enable-button");  
    $(pistolButton).removeClass("disable-button");
    
  }

  if (rifleButton.disabled) {
    $(rifleButton).addClass("disable-button");
    $(rifleButton).removeClass("enable-button");    
  }else{
    $(rifleButton).addClass("enable-button");   
    $(rifleButton).removeClass("disable-button");    
  }

  if (shotgunButton.disabled) {
    $(shotgunButton).addClass("disable-button");
    $(shotgunButton).removeClass("enable-button");    
  }else{
    $(shotgunButton).addClass("enable-button");   
    $(shotgunButton).removeClass("disable-button");
    
  }

  if (rifleButton.disabled) {
    $(rifleButton).addClass("disable-button");
    $(rifleButton).removeClass("enable-button");    
    
  }else{
    $(rifleButton).addClass("enable-button");   
    $(rifleButton).removeClass("disable-button");
    
  }

  if (reloadButton.disabled) {
    $(reloadButton).addClass("disable-button");
    $(reloadButton).removeClass("enable-button"); 
    
  }else{
    $(reloadButton).addClass("enable-button"); 
    $(reloadButton).removeClass("disable-button");
    
  }

  if (protectButton.disabled) {
    $(protectButton).addClass("disable-button");
    $(protectButton).removeClass("enable-button"); 
    
  }else{
    $(protectButton).addClass("enable-button"); 
    $(protectButton).removeClass("disable-button");
    
  }

  if (readyButton.disabled) {
    $(readyButton).addClass("disable-button");
    $(readyButton).removeClass("enable-button");     
  }else{
    $(readyButton).addClass("enable-button"); 
    $(readyButton).removeClass("disable-button");
    
  }
  if ( leaveButton != undefined) {
    if (leaveButton.disabled) {
      $(leaveButton).addClass("disable-button");
      $(leaveButton).removeClass("enable-button");     
    }else{
      $(leaveButton).addClass("enable-button"); 
      $(leaveButton).removeClass("disable-button");
    }
  }
};

//initialize socket listeners (one listener per socket.on for the eventnames) and logic

//add yourself to the globally loggedinusers array for counting all users
socket.emit('addToLoggedInUsers', {'username':username});

// connect to room and create an player object
socket.emit('roomConnect', {
  'roomcode': roomcode,
  'username':username,
  'gravURL':gravURL
});


//if errors occur or user is not authenticated, send him back to the root
socket.on('backToLobby', function(){
  window.location.href ='/';
});

//if errors occur or user is not authenticated, log him out
socket.on('kickUser', function(){
  window.location.href ='/logout';
});
  
//update the list of connected users if a new user connected or disonnected
socket.on('updateUsers', function(data){
  room= data.room;
  console.log('User count changed, new Usercount: ' + room.playerObjects.length);
});

//user successfully connected to the room, !! First user action awaited !! --> wait for clicking ready
socket.on('connectedToRoom', function(data){
  room= data.room
  console.log('Du bist mit dem Raum ' + room.roomcode + ' verbunden. Insgesamt sind verbunden: ' + room.playerObjects.length);
  
  //wenn richtig verbunden, aktiviere readybutton
  readyButton.disabled=false;
  changeButtonStatus();
});

//started game after everyone is ready, check which player you are and check who are your enemies
socket.on('startGame', function(data){
  shootButton.disabled=false;
  protectButton.disabled=false;
  reloadButton.disabled=false;
  
  players= data.players;   

  for(i=0; i < players.length; i++){
    if(players[i].name===username){
      yourselfPlayer=players[i];
      console.log('You are ' + yourselfPlayer.name);
    } else{
      enemies.push(players[i]);
    }
  }
  
  socket.emit('gameStarted'); //after check of players acknowledge that the game started
  console.log(room.roomcode + ' started');
  preloader();

  
});

//begin next/first round

socket.on('nextRound', function(data){

 
  players= data.players;

  for(i=0; i < players.length; i++){ // check players for yourself and enemies
    if(players[i].name===username){
      yourselfPlayer=players[i];
    } else{
      enemies = [];
      enemies.push(players[i]);
    }
  }

  //!!!Show actual stats here!!!
  
  console.log("Your Stats: Lifes: " + yourselfPlayer.lives 
  + ", Ammo: " + yourselfPlayer.ammo
  + ", Name: " + yourselfPlayer.name + "   ");

  for(i=0; i < enemies.length; i++){      

    console.log("Enemie Stats: Lifes: " + enemies[i].lives 
    + ", Ammo: " + enemies[i].ammo
    + ", Name: " + enemies[i].name + "   ");
  }

  updateInfo();
  console.log("UpdateInfo");

  //player ends here every round to input new action

  //reset action variables
  chosenAction=null;
  attackTypeChosen=null;

  if(yourselfPlayer.alive==false){
    pistolButton.disabled = true;
    shotgunButton.disabled = true;
    rifleButton.disabled = true;
    shootButton.disabled=true;
    protectButton.disabled=true;
    reloadButton.disabled=true;
    readyButton.disabled=true;
  }

  deactivateNotAllowedActionButtons(yourselfPlayer);
  changeButtonStatus();


});


//check actions if everyone has chosen an action
socket.on('allUsersHaveChosenAction', function(){   
  socket.emit('roundCheckActions');
});  

socket.on('startAnimation', function(data) {

  // Who is who?

  for (i = 0; i < players.length; i++) {
    if (players[i].name === username) {
      yourselfPlayer = players[i];
    } else {
      var enemies = [];
      enemies.push(players[i]);
    }
  }

  // log inhalte

  console.log("Your Stats: Lifes: " + yourselfPlayer.lives
    + ", Ammo: " + yourselfPlayer.ammo
    + ", Name: " + yourselfPlayer.name + "   ");

  for (i = 0; i < enemies.length; i++) {

    console.log("Enemie Stats: Lifes: " + enemies[i].lives
      + ", Ammo: " + enemies[i].ammo
      + ", Name: " + enemies[i].name + "   ");
  }

  // yourselPlayer.lives 
  // 
});

//check actions if everyone has chosen an action
socket.on('endGame', function(data){
  console.log('And the Winner is: ' + data.finishedRoom.winner.name);
  console.log('These Players lost: ');
  for(i=0; i<data.finishedRoom.loosers.length; i++){
    console.log(data.finishedRoom.loosers[i].name + ', ');
  }

  pistolButton.disabled = true;
  shotgunButton.disabled = true;
  rifleButton.disabled = true;
  shootButton.disabled=true;
  protectButton.disabled=true;
  reloadButton.disabled=true;
  readyButton.disabled=true;
  if (leaveButton != undefined) {
  leaveButton.disabled=false;
  }

  changeButtonStatus();
  afterloader(data);
});  

//print a textmessage
socket.on('textMessage', function(data){
  console.log(data);
}); 





// PreLoader animation

function preloader() {
  setTimeout(function () {
    $('.bulletsvg').velocity({
      opacity: 0.95,
      translateX: "1200px"
    }, {
        duration: 1000,
        complete: function () {
          $('.wrapperLoader').velocity({
            translateY: "-100%"
          })
        }
      })
  }, 2000)
}


// AfterLoader animation + Leave

function afterloader(data) {
  if (data.finishedRoom.winner.name === username) {
    document.getElementById('afterloader').innerHTML = "<div class='endgame' ><div><img class='bullet' src='styles/img/bullet.svg'><img class='skull' src='styles/img/trophy.svg'><p>Du hast gewonnen!</p><button class='js-button-leave'>Leave</button></div></div>";
  } else {
    document.getElementById('afterloader').innerHTML = "<div class='endgame' ><div><img class='bullet' src='styles/img/bullet.svg'><img class='skull' src='styles/img/skull.svg'><p>Du hast verloren!</p><button class='js-button-leave'>Leave</button></div></div>";
  }



  setTimeout(function () {
    $('.endgame').velocity({
      top: "-90%"
    }, {
        duration: 1000,
        complete: function () {
          $('.endgame').velocity({
            top: "0"
          })
        }
      })
  }, 2000)
}






// Fight animations

function shoot1(hitOne, isHitting) {


  if ($('#' + hitOne.id + '').hasClass('armor')) {
    $("#" + hitOne.id + "").addClass("slash-anim rumble");
    setTimeout(function () {
      $("#" + hitOne.id + "").removeClass('slash-anim rumble');
    },
      500);
  } else {

    $("#" + hitOne.id + "").addClass("slash-anim");
    setTimeout(function () {
      $("#" + hitOne.id + "").removeClass('slash-anim');
    },
      500);
    if (hitOne.shoot == false) {
      showHit(hitOne, "dodge");
    }
  }


  if ($('#' + isHitting.id + '').hasClass('armor')) {
    $("#" + isHitting.id + "").addClass("slash-anim rumble");
    setTimeout(function () {
      $("#" + isHitting.id + "").removeClass('slash-anim rumble');
    },
      500);
  } else {

    $("#" + isHitting.id + "").addClass("slash-anim");
    setTimeout(function () {
      $("#" + isHitting.id + "").removeClass('slash-anim');
    },
      500);
    if (isHitting.shoot == false) {
      showHit(isHitting, "dodge");
    }
  }
};


function updateInfo () {
  $('#enemyammo').empty();
  $('#liveenemy').empty();
  $('#enemyname').empty();
  $('#enemy').empty();

  document.getElementById('enemyammo').innerHTML = enemies[0].ammo + " Ammo";
  document.getElementById('liveenemy').innerHTML = enemies[0].lives + " Leben";
  document.getElementById('enemyname').innerHTML = enemies[0].name;
  document.getElementById('enemy').innerHTML = "<img src='" + enemies[0].gravURL + "' />";
}

