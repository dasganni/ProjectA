var shootButton = document.querySelector(".js-button-shoot");
var pistolButton = document.querySelector(".js-button-pistol");
var rifleButton = document.querySelector(".js-button-rifle");
var shotgunButton = document.querySelector(".js-button-shotgun");
var reloadButton = document.querySelector(".js-button-reload");
var protectButton = document.querySelector(".js-button-protect");
var readyButton = document.querySelector(".js-button-ready");

var chosenAction = false;
var attackTypeChosen = false;
var yourselfPlayer;
var enemies= [];

pistolButton.disabled = true;
shotgunButton.disabled = true;
rifleButton.disabled = true;
shootButton.disabled=true;
protectButton.disabled=true;
reloadButton.disabled=true;
readyButton.disabled=false;
//functions

var actionChosen = function(yourselfplayername, chosenAction, chosenAttacktype ){
  pistolButton.disabled = true;
  shotgunButton.disabled = true;
  rifleButton.disabled = true;
  shootButton.disabled=true;
  protectButton.disabled=true;
  reloadButton.disabled=true;

  changeButtonStatus();
  
  socket.emit('setPlayerAction', {
    'actionUsername': yourselfplayername, 
    'action':chosenAction, 
    'attacktype':chosenAttacktype
  });
  socket.emit('actionOnClientChosen', {
    'username': yourselfplayername 
  });
}

var buttonClicked = function(buttonNumber){
  if(buttonNumber==0){//shootbutton
    deleteEventListeners();

    

  }
  else if(buttonNumber==1){//pistolbutton
    deleteEventListeners();
    chosenAction=0;
    chosenAttacktype=3;
    actionChosen(yourselfPlayer.name, chosenAction, chosenAttacktype);       
  }
  else if(buttonNumber==2){//riflebutton
    deleteEventListeners();

    chosenAction=0;
    chosenAttacktype=2;
    actionChosen(yourselfPlayer.name, chosenAction, chosenAttacktype);    
  }
  else if(buttonNumber==3){//shotgunbutton
    deleteEventListeners();

    
    chosenAction=0;
    chosenAttacktype=1;
    actionChosen(yourselfPlayer.name, chosenAction, chosenAttacktype);      
  }
  else if(buttonNumber==4){//reloadbutton
    deleteEventListeners();

    chosenAction=1;
    chosenAttacktype=0;        
    actionChosen(yourselfPlayer.name, chosenAction, chosenAttacktype);         
  }
  else if(buttonNumber==5){//protectbutton
    deleteEventListeners();

    
    chosenAction=2;
    chosenAttacktype=0;        
    actionChosen(yourselfPlayer.name, chosenAction, chosenAttacktype);    
  }else{
    deleteEventListeners();    

    
    console.log("Not existing Button clicked?!")
  }
}

var deleteEventListeners = function(){
  shootButton.removeEventListener("click", buttonClicked);
  pistolButton.removeEventListener("click", buttonClicked);      
  rifleButton.removeEventListener("click", buttonClicked);         
  shotgunButton.removeEventListener("click", buttonClicked);      
  reloadButton.removeEventListener("click", buttonClicked);      
  protectButton.removeEventListener("click", buttonClicked);  
  
}

var deactivateNotAllowedActionButtons = function(playerObject){

  pistolButton.disabled=true; 
  shotgunButton.disabled=true; 
  rifleButton.disabled=true;
  reloadButton.disabled=false;
  shootButton.disabled=false;
  protectButton.disabled=false;

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
  }
};

//begin socket listeners and logic
socket.emit('addToLoggedInUsers', {'username':username});


// connect to game
socket.emit('gameConnect', {
  'roomcode': roomcode,
  'username':username,
  'gravURL':gravURL
});

//get back to lobby initiated by server

socket.on('backToLobby', function(){
  window.location.href ='/';
});
  
//update the list of connected users
socket.on('updateUsers', function(data){
  room= data.room;
  console.log('User joined, new Usercount: ' + room.users.length);
});

//user connected to the room
socket.on('connectedToRoom', function(data){
  room= data.room
  console.log('Du bist mit dem Raum ' + room.roomcode + ' verbunden. Insgesamt sind verbunden: ' + room.users.length);


  readyButton.addEventListener("click", function () {
     $(".js-button-ready").addClass("display-none");
    readyButton.disabled = true; //readybutton
    changeButtonStatus();
    socket.emit('readyClicked', {
      'username':username
    });  
  });

});

//started game after everyone is ready
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
  
  socket.emit('gameStarted');
  console.log(room.roomcode + ' started');
  
});

//begin next round
socket.on('nextRound', function(data){
  players= data.players;
  console.log("nextRound")

  for(i=0; i < players.length; i++){
    if(players[i].name===username){
      yourselfPlayer=players[i];
    } else{
      var enemies = [];
      enemies.push(players[i]);
    }
  }
  
  console.log("Your Stats: Lifes: " + yourselfPlayer.lives 
  + ", Ammo: " + yourselfPlayer.ammo
  + ", Name: " + yourselfPlayer.name + "   ");

  for(i=0; i < enemies.length; i++){      

    console.log("Enemie Stats: Lifes: " + enemies[i].lives 
    + ", Ammo: " + enemies[i].ammo
    + ", Name: " + enemies[i].name + "   ");
  }

  deactivateNotAllowedActionButtons(yourselfPlayer);
  changeButtonStatus();

  chosenAction=null;
  attackTypeChosen=null;

  shootButton.addEventListener("click", function (){buttonClicked(0)});

  pistolButton.addEventListener("click", function (){buttonClicked(1)});   
  
  rifleButton.addEventListener("click", function (){buttonClicked(2)});

  shotgunButton.addEventListener("click", function (){buttonClicked(3)});

  reloadButton.addEventListener("click", function (){buttonClicked(4)});

  protectButton.addEventListener("click", function (){buttonClicked(5)});
  
})

//check actions if everyone has chosen an action
socket.on('allUsersHaveChosenAction', function(){
  socket.emit('roundCheckActions');
});   

//print a textmessage
socket.on('textMessage', function(data){
  console.log(data);
}); 