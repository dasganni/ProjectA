let shootButton = document.querySelector(".js-button-shoot");
let pistolButton = document.querySelector(".js-button-pistol");
let rifleButton = document.querySelector(".js-button-rifleButton");
let shotgunButton = document.querySelector(".js-button-shotgun");
let reloadButton = document.querySelector(".js-button-reload");
let protectButton = document.querySelector(".js-button-protect");
let actionChosen = false;
let attackTypeChosen = false;





socket.emit('gameConnect', {
  'roomcode': roomcode,
  'username':username,
  'gravURL':gravURL
  });

socket.on('connectedToRoom', function(data){
  room= data.room
  console.log('Du bist mit dem Raum ' + room.roomcode + ' verbunden. Insgesamt sind verbunden: ' + room.users.length);

  socket.on('updateUsers', function(data){
    room= data.room;
    console.log('User joined, new Usercount: ' + room.users.length);
  });

  let readyButton = document.querySelector(".js-button-ready");
  readyButton.addEventListener("click", function () {
    socket.emit('readyClicked', {
      'username':username
    });  
  });

  socket.on('startGame', function(){
    
    socket.emit('gameStarted');
    console.log(room.roomcode + ' started');



    socket.on('playerStats', function(data){
      players= data.players;
      for(i=0; i < players.length; i++){
        if(players[i].name===username){
          yourselfPlayer=players[i];
          console.log('You are ' + yourselfPlayer.name);
        } else{
          let enemies = [];
          enemies.push(player[i]);
        }
      }
    });

    deactivateNotAllowedActionButtons(yourselfPlayer)

    console.log("Your Stats: Lifes: " + yourselfPlayer.lives 
    + ", Ammo: " + yourselfPlayer.ammo
    + ", Name: " + yourselfPlayer.name + "   ");

    for(i=0; i < enemies.length; i++){      

      console.log("Enemie Stats: Lifes: " + enemies[i].lives 
      + ", Ammo: " + enemies[i].ammo
      + ", Name: " + enemies[i].name + "   ");
    }
    
    actionChosen=false;
    attackTypeChosen=false;

    shootButton.addEventListener("click", function () {
      chosenAction=0;
      actionChosen=true;
    });

    pistolButton.addEventListener("click", function () {
      chosenAttacktype=2;
      attackTypeChosen=true;
    });

    rifleButton.addEventListener("click", function () {
      chosenAttacktype=1;
      attackTypeChosen=true;
    });

    shotgunButton.addEventListener("click", function () {
      chosenAttacktype=0;
      attackTypeChosen=true;
    });

    reloadButton.addEventListener("click", function () {
      chosenAction=1;
      actionChosen=true;
    });

    protectButton.addEventListener("click", function () {
      chosenAction=2;
      actionChosen=true;
    });

    if(actionChosen && attackTypeChosen){
      socket.emit('setPlayerAction', {
      'actionUsername': yourselfPlayer.name, 
      'action':chosenAction, 
      'attacktype':chosenAttacktype
      });
    }
    
    socket.on('textMessage', function(data){
      console.log(data);
    }); 

  });

}); 



socket.on('backToLobby', function(){
 window.location.href ='/';
});

deactivateNotAllowedActionButtons = function(playerObject){

  pistolButton.disabled=true;
  shotgunButton.disabled=true;
  rifleButton.disabled=true;

  //activate specific buttons

  if(playerObject.getAmmo()>=5){
    //activate all weapons
    pistolButton.disabled=false;
    shotgunButton.disabled=false;
    rifleButton.disabled=false;

  } else if(playerObject.getAmmo()<5 && playerObject.getAmmo()>=3){
    //activate rifle and pistol button
    pistolButton.disabled=false;
    shotgunButton.disabled=true;
    rifleButton.disabled=false;

  } else if(playerObject.getAmmo()>0 && playerObject.getAmmo()<3){
    //activate only pistol button
    pistolButton.disabled=false;
    shotgunButton.disabled=true;
    rifleButton.disabled=true;
    
  }
  
}