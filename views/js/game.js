socket.emit('gameConnect', {'roomcode': roomcode, 'username':username, 'gravURL':gravURL});

socket.on('connectedToRoom', function(data){
  room= data.room
  console.log('Du bist mit dem Raum ' + room.roomcode + ' verbunden. Insgesamt sind verbunden: ' + room.users.length);
}); 

socket.on('backToLobby', function(){
 window.location.href ='/';
});