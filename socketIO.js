exports.initializeSocket = function(http){
const io = require('socket.io')(http);

updateRoomInCreatedRooms = function(updatedRoom){
    for (let i = 0; i <= createdRooms.length; i++) {
        if(createdRooms.length>0){
            if (createdRooms[i].roomcode === updatedRoom.roomcode) {
                createdRooms[i]= updatedRoom;
            } else{
                socket.emit('backToLobby');             
            }
        } else{
            socket.emit('backToLobby');                   
        }
    }
}

io.on('connection', function(socket){
    
        //log logged in username
    
        socket.on('gameConnect', function(data){
            socket.roomcode = data.roomcode;
            socket.username = data.username;
            socket.gravURL = data.gravURL;
               // Look for the requested room
            for (let i = 0; i <= createdRooms.length; i++) {
                if(createdRooms.length>0){
                    if (createdRooms[i].roomcode === socket.roomcode) {
                        createdRooms[i].users.push(socket.username);
                        socket.room= createdRooms[i];
                        socket.join(socket.room.roomcode); 
                        console.log(socket.username + " connected to the Room " + socket.room.roomcode);
                        io.in(socket.room.roomcode).emit('connectedToRoom', {room: socket.room});  
                        io.in(socket.room.roomcode).emit('updateUsers', {room: socket.room});                   
                        break;
                    } else{
                        socket.emit('backToLobby');             
                    }
                } else{
                    socket.emit('backToLobby');                   
                }
            }

            let player = new Player('socket.username');
            socket.room.playerObjects.push(player);
            updateRoomInCreatedRooms(socket.room);
            

        });  

        //check the ready users

        socket.on('readyClicked', function(readyUser){
            readyUsername = readyUser.username;
            socket.room.usersReady.push(readyUsername);
            updateRoomInCreatedRooms(socket.room);
            console.log(readyUsername + ' is ready');
            

            if(socket.room.usersReady.length===socket.room.users.length && socket.room.users.length >= socket.room.minUsers){
                io.in(socket.room.roomcode).emit('startGame');               
            }

        });

        //game started

        socket.on('gameStarted', function(){
            gameNotFinished=true;
            
            while(gameStartedBoolean) { //Schleife für Spielverlauf

                updateRoomInCreatedRooms(socket.room);
                     
                //send playerobjects to the clients every round
                io.in(socket.room.roomcode).emit('playerStats', {
                    players: socket.room.playerObjects                
                });


                socket.on('setPlayerAction', function(userAction){                  //Übergabe von Aktionen der Spieler von Clients (Mehrere in Variablen in einer userAction)

                    for(i=0; i < socket.room.playerObjects.length; i++){
                        if(socket.room.playerObjects[i].name===userAction.actionUsername){
                            
                            if (userAction.action == 0){                            //action shoot
                            
                                if (userAction.attackType == 0){                    //shoot shotgun when shooting
                                    socket.room.playerObjects[i].shootShotgun();
                                }
                                else if (userAction.attackType==1){                 //shoot rifle when shooting
                                    socket.room.playerObjects[i].shootRifle();
                                }
                                else{                                               //shoot pistol when shooting
                                    socket.room.playerObjects[i].shootPistol();
                                }
                            } else if(userAction.action ==1){                       //action reload
                                socket.room.playerObjects[i].reload();
                            }
                            else{                                                   //action defend
                                socket.room.playerObjects[i].defend();
                            }
                        }


                    }
                });

                //Auswertung der Übergaben von Clients (Berechnung Schaden und Spielverlauf)

                if (socket.room.playerObjects[0].getAttack()>socket.room.playerObjects[1].getAttack() && !socket.room.playerObjects[1].getDefense()){
                    socket.room.playerObjects[1].looseLife((socket.room.playerObjects[0].getAttack()-socket.room.playerObjects[1].getAttack()));
                }
    
                else if (socket.room.playerObjects[1].getAttack()>socket.room.playerObjects[0].getAttack() && !socket.room.playerObjects[0].getDefense()){
                    socket.room.playerObjects[0].looseLife((socket.room.playerObjects[1].getAttack()-socket.room.playerObjects[0].getAttack()));
                }
    
                else {
                    socket.broadcast.emit('textMessage', "Nichts passiert.");
                }
                console.log(socket.room.playerObjects[0].getLives() + "  " + socket.room.playerObjects[1].getLives());

                //Check if Players died this round
                
                for(i=0; i < socket.room.playerObjects.length; i++){
                    if (socket.room.playerObjects[i].getLives()==0){
                        socket.room.usersDead.push(socket.room.playerObjects[i].name);
                        socket.rooms.playerObjects[i].setDead();
                        console.log(socket.room.playerObjects[i].name + ' died!');                                        
                    }
                }

                if(socket.room.playersDead.length - socket.rooms.playerObjects.length===1){
                    for(i=0; i < socket.room.playerObjects.length; i++){
                        if (socket.room.playerObjects[i].getLives()>0){
                            let winner;
                            winner=socket.rooms.playerObjects[i]; 
                            console.log(winner.name + ' hat gewonnen!!!');
                            gameNotFinished=false;
                        }
                                                            
                        
                    }
                }
            
            }                
            socket.broadcast.emit('backToLobby');
        });

        
        //Spiellogik - Ingame
    
        /*socket.on('lobbyConnect', function(socketSessionID){
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


        });*/

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
                                console.log('Room ' + createdRooms[i].roomcode + ' is empty now and has been deleted!');
                                createdRooms.splice(i, 1);                            
                            }
                            break;          
                        }
                    }
                }

                console.log(socket.username + ' disconnected from Room');
        
        });
    

      });
}