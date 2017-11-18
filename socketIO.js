exports.initializeSocket = function(http){
    const io = require('socket.io')(http);  

    let PlayerClassExport = require(__dirname + '/player.js');
    let Player= PlayerClassExport.Player;

    io.on('connection', function(socket){

        //update room function

        let updateRoomInCreatedRooms = function (updatedRoom){
            for (let i = 0; i < createdRooms.length; i++) {
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

        let resetUserAttributes = function (){
            for (let i = 0; i < socket.room.playerObjects.length; i++) {
                socket.room.playerObjects[i].attack= 0;
                socket.room.playerObjects[i].__defend = false;                  
            }
        }


        //log logged in username
    
        socket.on('gameConnect', function(data){
            socket.roomcode = data.roomcode;
            socket.username = data.username;
            socket.gravURL = data.gravURL;
            // Look for the requested room
            for (let i = 0; i < createdRooms.length; i++) {
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

            let player = new Player(socket.username);
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
                players= socket.room.playerObjects;
                io.in(socket.room.roomcode).emit('startGame', {
                    players: socket.room.playerObjects
                });               
            }

        });

        //client has chosen action

        socket.on('actionOnClientChosen', function(readyUser){
            readyUsername = readyUser.username;
            socket.room.usersChosenAction.push(readyUsername);
            updateRoomInCreatedRooms(socket.room);
            console.log(readyUsername + ' has chosen his action');
            

            if(socket.room.usersChosenAction.length===socket.room.users.length && socket.room.users.length >= socket.room.minUsers){
                for (let i = 0; i < createdRooms.length; i++) {
                    if(createdRooms.length>0){
                        if (createdRooms[i].roomcode === socket.room.roomcode) {
                            socket.room.allUsersHaveChosenAction=true;
                            updateRoomInCreatedRooms(socket.room);
                            io.in(socket.room.roomcode).emit('allUsersHaveChosenAction');   
                        } else{
                            socket.emit('backToLobby');             
                        }
                    } else{
                        socket.emit('backToLobby');                   
                    }
                }
            }

        });

        //set the chosen action

        socket.on('setPlayerAction', function(userAction){                  //Übergabe von Aktionen der Spieler von Clients (Mehrere in Variablen in einer userAction)
            
            for(i=0; i < socket.room.playerObjects.length; i++){
                if(socket.room.playerObjects[i].name===userAction.actionUsername){
                    
                    if (userAction.action == 0){                            //action shoot
                    
                        if (userAction.attackType == 1){                    //shoot shotgun when shooting
                            socket.room.playerObjects[i].shootShotgun();
                        }
                        else if (userAction.attackType==2){                 //shoot rifle when shooting
                            socket.room.playerObjects[i].shootRifle();
                        }
                        else if (userAction.attackType==3){                                               //shoot pistol when shooting
                            socket.room.playerObjects[i].shootPistol();
                        } else {
                            socket.room.playerObjects[i].reload();
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

        //game started

        socket.on('gameStarted', function(){
            
            updateRoomInCreatedRooms(socket.room);                

            //send playerobjects to the clients every round
            io.in(socket.room.roomcode).emit('playerStats', {
                'players': socket.room.playerObjects             
            });

            io.in(socket.room.roomcode).emit('nextRound', {
                'players': socket.room.playerObjects             
            });
                            
        });

        
        //Spiellogik - Ingame

        socket.on('roundCheckActions', function(){

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

            //Check if Players died this round
            
            for(i=0; i < socket.room.playerObjects.length; i++){
                if (socket.room.playerObjects[i].getLives()==0){
                    socket.room.usersDead.push(socket.room.playerObjects[i].name);
                    socket.room.playerObjects[i].setDead();
                    console.log(socket.room.playerObjects[i].name + ' died!');                                        
                }
            }

            if(typeof socket.room.usersDead !== 'undefined'){
                if(socket.room.usersDead.length - socket.room.playerObjects.length===1){
                    for(i=0; i < socket.room.playerObjects.length; i++){
                        if (socket.room.playerObjects[i].getLives()>0){
                            let winner;
                            winner=socket.room.playerObjects[i]; 
                            console.log(winner.name + ' hat gewonnen!!!');
                            gameNotFinished=false;
                        }
                                                            
                        
                    }
                }
            }

            resetUserAttributes(socket.room);            

            updateRoomInCreatedRooms(socket.room);            

            io.in(socket.room.roomcode).emit('playerStats', {
                'players': socket.room.playerObjects             
            });

            io.in(socket.room.roomcode).emit('nextRound', {
                'players': socket.room.playerObjects             
            });

        });
            

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