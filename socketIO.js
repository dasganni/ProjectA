exports.initializeSocket = function(http){
const io = require('socket.io')(http);



io.on('connection', function(socket){
    
        //log logged in username
    
        socket.on('gameConnect', function(data){
            socket.roomcode = data.roomcode;
            socket.username = data.username;
            socket.gravURL = data.gravURL;
            socket.join(room.roomcode);
               // Look for the requested room
            for (let i = 0; i < createdRooms.length; i++) {
                if (createdRooms[i].roomcode === socket.roomcode) {
                    createdRooms[i].users.push(socket.username);
                    room= createdRooms[i];                
                    break;
                }
            }
            console.log(socket.username + " connected to the Room " + room.roomcode);
            io.in(room.roomcode).emit('connectedToRoom', {room: room});

        });  

/*        
        //Spiellogik - Ingame
    
        socket.on('lobbyConnect', function(socketSessionID){
            socket.sessionID = socketSessionID;
            let players = [];

            socket.on('ingameUser', function(ingameUsername){
                socket.ingameUsername = ingameUsername;
                console.log(socket.ingameUsername + ' connected to LobbyID: ' + socket.sessionID);  
                let ingameUsername = new Player(ingameUsername); 
                players.push(ingameUsername);
            });


            while(players[0].getLives() > 0 && players[1].getLives() > 0) { //Schleife für Spielverlauf

                
                socket.broadcast.emit('playerStats', {
                    player1Lives: players[0].lives,
                    player1Ammo: players[0].ammo,
                    player1Name: players[0].name,
                    player2Lives: players[1].lives,
                    player2Ammo: players[1].ammo,
                    player2Name: players[1].name

                });


                socket.on('gameRound', function(userAction){ //Übergabe von Aktionen der Spieler von Clients (Mehrere in Variablen in einer userAction)
                    socket.action = userAction.action;
                    socket.attackType = userAction.attackType;
                    socket.actionUsername = userAction.actionUsername;
                });

                //Auswertung der Übergaben von Clients (Berechnung Schaden und Spielverlauf)

                if (players[0].getAttack()>players[1].getAttack() && !players[1].getDefense()){
                    players[1].looseLife((players[0].getAttack()-players[1].getAttack()));
                }
    
                else if (players[1].getAttack()>players[0].getAttack() && !players[0].getDefense()){
                    players[0].looseLife((players[1].getAttack()-players[0].getAttack()));
                }
    
                else {
                    socket.broadcast.emit('textMessage', "Nichts passiert.");
                }
                System.out.println(player1.getLives() + "  " + player2.getLives());
            
            
            
            }

            //Spielerleben fallen auf Null
            
            if (player[0].getLives()==0){
                 socket.broadcast.emit('textMessage', "Spieler 2 gewinnt!");
                 socket.broadcast.emit('backToDashboard'); //Schicke den User zurück zum Dashboard
            }
            else{
                socket.broadcast.emit('textMessage', "Spieler 1 gewinnt!");
                socket.broadcast.emit('backToDashboard');                
            }


        });

*/
        //Der User hat sich disconnected
    
        socket.on('disconnect', function(){

            //Löschen der User aus dem Roomobjekt, wenn leer, Raum löschen

            for (let i = 0; i < createdRooms.length; i++) {
                for (let j = 0; j < createdRooms[i].users.length; j++) {
                    if (createdRooms[i].users[j] === socket.username) {

                        createdRooms[i].users.splice(j, 1);

                        for (let k = 0; k < createdRooms[i].usersReady.length; k++) {
                            if (createdRooms[i].usersReady[k] === socket.username) {
                                
                                createdRooms[i].usersReady.splice(k,1);
                            }
                        }
                        
                        if (createdRooms[i].users.length > 0) {
                            io.to(createdRooms[i].roomcode).emit('refreshUserCount', createdRooms[i].users.length);
                        }
                        else {
                            rooms.splice(i, 1);
                            console.log('Room ' + createdRooms[i].roomcode + ' is empty now and has been deleted!')
                        }
                        break;          
                    }
                }
            }

            console.log(socket.username + ' disconnected');
        });
    

      });
}