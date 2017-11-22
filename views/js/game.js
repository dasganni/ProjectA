let shootButton = document.querySelector(".js-button-shoot");
let pistolButton = document.querySelector(".js-button-pistol");
let rifleButton = document.querySelector(".js-button-rifle");
let shotgunButton = document.querySelector(".js-button-shotgun");
let reloadButton = document.querySelector(".js-button-reload");
let protectButton = document.querySelector(".js-button-protect");
let actionChosen = false;
let attackTypeChosen = false;
let yourselfPlayer;
let enemies= [];

socket.on('backToLobby', function(){
  window.location.href ='/';
});

socket.emit('gameConnect', {
  'roomcode': roomcode,
  'username':username,
  'gravURL':gravURL
});

socket.on('updateUsers', function(data){
  room= data.room;
  console.log('User joined, new Usercount: ' + room.users.length);
});

socket.on('connectedToRoom', function(data){
  room= data.room
  console.log('Du bist mit dem Raum ' + room.roomcode + ' verbunden. Insgesamt sind verbunden: ' + room.users.length);

  let readyButton = document.querySelector(".js-button-ready");
  readyButton.addEventListener("click", function () {
    socket.emit('readyClicked', {
      'username':username
    });  
  });

  socket.on('startGame', function(data){

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



    socket.on('playerStats', function(data){
      players= data.players;
           
      for(i=0; i < players.length; i++){
        if(players[i].name===username){
          yourselfPlayer=players[i];
        } else{
          let enemies = [];
          enemies.push(players[i]);
        }
      }
    });

    socket.on('nextRound', function(data){
      players= data.players;
      
      console.log("Your Stats: Lifes: " + yourselfPlayer.lives 
      + ", Ammo: " + yourselfPlayer.ammo
      + ", Name: " + yourselfPlayer.name + "   ");
  
      for(i=0; i < enemies.length; i++){      
  
        console.log("Enemie Stats: Lifes: " + enemies[i].lives 
        + ", Ammo: " + enemies[i].ammo
        + ", Name: " + enemies[i].name + "   ");
      }

      deactivateNotAllowedActionButtons(yourselfPlayer)

      actionChosen=false;
      attackTypeChosen=false;
      
      shootButton.addEventListener("click", function () {
        //no action, just a popup button for the weapons
      });
  
      pistolButton.addEventListener("click", function () {
        chosenAction=0;
        actionChosen=true;
        chosenAttacktype=3;
        attackTypeChosen=true;
        socket.emit('actionOnClientChosen', {
          'username': yourselfPlayer.name 
        });
        socket.emit('setPlayerAction', {
          'actionUsername': yourselfPlayer.name, 
          'action':chosenAction, 
          'attacktype':chosenAttacktype
        });
      });
  
      rifleButton.addEventListener("click", function () {
        chosenAction=0;
        actionChosen=true;
        chosenAttacktype=2;
        attackTypeChosen=true;
        socket.emit('actionOnClientChosen', {
          'username': yourselfPlayer.name 
        });
        socket.emit('setPlayerAction', {
          'actionUsername': yourselfPlayer.name, 
          'action':chosenAction, 
          'attacktype':chosenAttacktype
        });
      });
  
      shotgunButton.addEventListener("click", function () {
        chosenAction=0;
        actionChosen=true;
        chosenAttacktype=1;
        attackTypeChosen=true;
        socket.emit('actionOnClientChosen', {
          'username': yourselfPlayer.name 
        });
        socket.emit('setPlayerAction', {
          'actionUsername': yourselfPlayer.name, 
          'action':chosenAction, 
          'attacktype':chosenAttacktype
        });
      });
  
      reloadButton.addEventListener("click", function () {
        chosenAction=1;
        chosenAttacktype=0;        
        actionChosen=true;
        attackTypeChosen=true;      
        socket.emit('actionOnClientChosen', {
          'username': yourselfPlayer.name 
        });
        socket.emit('setPlayerAction', {
          'actionUsername': yourselfPlayer.name, 
          'action':chosenAction, 
          'attacktype':chosenAttacktype
        });
      });
  
      protectButton.addEventListener("click", function () {
        chosenAction=2;
        chosenAttacktype=0;        
        actionChosen=true;
        attackTypeChosen=true;  
        actionChosen({
          yourselfplayername: yourselfPlayer.name,
          chosenAction: chosenAction,
          chosenAttacktype: chosenAttacktype        
        }); 

      });

      socket.on('allUsersHaveChosenAction', function(){
        socket.emit('roundCheckActions');
      });   
    });
    
    socket.on('textMessage', function(data){
      console.log(data);
    }); 

  });

}); 

actionChosen = function(actionsChosen){
  yourselfplayername = actionsChosen.yourselfplayername;
  chosenAction = actionsChosen.chosenAction;
  chosenAttacktype = actionsChosen.chosenAttacktype;

  socket.emit('setPlayerAction', {
    'actionUsername': yourselfplayername, 
    'action':chosenAction, 
    'attacktype':chosenAttacktype
  });
  socket.emit('actionOnClientChosen', {
    'username': yourselfplayername 
  });
}
  

deactivateNotAllowedActionButtons = function(playerObject){

  pistolButton.disabled=true;
  shotgunButton.disabled=true;
  rifleButton.disabled=true;


  //activate specific buttons

  if(playerObject.ammo >= 5){
    //activate all weapons
    pistolButton.disabled=false;
    shotgunButton.disabled=false;
    rifleButton.disabled=false;

  } else if(playerObject.ammo <5 && playerObject.ammo >= 3){
    //activate rifle and pistol button
    pistolButton.disabled=false;
    shotgunButton.disabled=true;
    rifleButton.disabled=false;

  } else if(playerObject.ammo > 0 && playerObject.ammo < 3){
    //activate only pistol button
    pistolButton.disabled=false;
    shotgunButton.disabled=true;
    rifleButton.disabled=true;
    
  }
  
}