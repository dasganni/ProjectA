exports.initializeSocket = function(http){
    const io = require('socket.io')(http);  

    let PlayerClassExport = require(__dirname + '/player.js');
    let Player= PlayerClassExport.Player;
    let userAlreadyInArray = false;

    //socket

    io.on('connection', function(socket){

        //functions used by socket
        
        //update room function
    
        let resetUserAttributes = function (roomIndex){
            for (let i = 0; i < createdRooms[roomIndex].playerObjects.length; i++) {
                createdRooms[roomIndex].playerObjects[i].attack= 0;
                createdRooms[roomIndex].playerObjects[i].__defend = false;                  
            }
        }
    
        let getRoomIndex = function(requestedRoomcode){
    
            for (let i = 0; i < createdRooms.length; i++) {
                if(createdRooms.length>0){
                    if (createdRooms[i].roomcode === requestedRoomcode) {
                        index = i;
                        return index;
                    } 
                } else{
                    socket.emit('backToLobby');                   
                }
            }
    
    
        }

        //initialize socket listeners on server

        //adds all logged in users in every ejs to the global loggedinusers array
        socket.on('addToLoggedInUsers', function(data){
            
            socket.username = data.username;
            
            for(i=0; i<=loggedInUsers.length; i++){
                if(loggedInUsers[i]==socket.username){
                    loggedInUsers.splice(i, 1);
                    socket.emit('kickUser');
                    break;
                }else{
                    loggedInUsers.push(socket.username);
                    break;               
                }
            }
        });

        //each client connecting to a room calls this listener --> create player object for all this users in the rooms
        socket.on('roomConnect', function(data){
            socket.roomcode = data.roomcode;
            socket.username = data.username;
            socket.gravURL = data.gravURL;
            userAlreadyInArray = false;
            

            socket.roomIndex = getRoomIndex(socket.roomcode);

            if(createdRooms[socket.roomIndex]==undefined || createdRooms[socket.roomIndex]==null){
                socket.emit('backToLobby');
            }else{
                //check if user reconnected, if so, don't create new player, let him use his old playerobject(but dead)
                if(createdRooms[socket.roomIndex].length>0){
                    for(i=0; i<createdRooms[socket.roomIndex].playerObjects.length; i++){
                        if(createdRooms[socket.roomIndex].playerObjects[i].name==socket.username){
                            socket.yourPlayerIndex=i;
                            userAlreadyInArray=true;
                        }
                    }       
                }
                if(userAlreadyInArray){
                    createdRooms[socket.roomIndex].playerObjects[socket.yourPlayerIndex].setDead();
                    io.in(createdRooms[socket.roomIndex].roomcode).emit('nextRound', { //start first round
                        'players': createdRooms[socket.roomIndex].playerObjects        
                    });
                }
                else{
                    let player = new Player(socket.username, socket.gravURL);
                    createdRooms[socket.roomIndex].playerObjects.push(player);
                    socket.join(createdRooms[socket.roomIndex].roomcode); 
                    console.log(socket.username + " connected to the Room " + createdRooms[socket.roomIndex].roomcode);
                    io.in(createdRooms[socket.roomIndex].roomcode).emit('connectedToRoom', {room: createdRooms[socket.roomIndex]});  
                    io.in(createdRooms[socket.roomIndex].roomcode).emit('updateUsers', {room: createdRooms[socket.roomIndex]});    
                }
                
            }            
            
        });  

        //check the ready users, if all users are ready, start the game on all clients in the room

        socket.on('readyClicked', function(readyUser){

            socket.roomIndex = getRoomIndex(socket.roomcode);            

            readyUsername = readyUser.username;
            createdRooms[socket.roomIndex].usersReady.push(readyUsername);
            console.log(readyUsername + ' is ready');
                        

            if(createdRooms[socket.roomIndex].usersReady.length===createdRooms[socket.roomIndex].playerObjects.length && createdRooms[socket.roomIndex].playerObjects.length >= createdRooms[socket.roomIndex].minUsers){
                players= createdRooms[socket.roomIndex].playerObjects;
                createdRooms[socket.roomIndex].playersReadyForNextRound=0;
                io.in(createdRooms[socket.roomIndex].roomcode).emit('startGame', {
                    players: createdRooms[socket.roomIndex].playerObjects
                });               
            }

        });

        //clients acknowledged gamestart

        socket.on('gameStarted', function(){
            
            socket.roomIndex = getRoomIndex(socket.roomcode);
            
            //start first round only by the last acknowledged client in this room

            createdRooms[socket.roomIndex].playersReadyForNextRound+=1;

            if(createdRooms[socket.roomIndex].playersReadyForNextRound==createdRooms[socket.roomIndex].playerObjects.length){
                createdRooms[socket.roomIndex].playersReadyForNextRound=0;
                
                io.in(createdRooms[socket.roomIndex].roomcode).emit('nextRound', { //start first round
                    'players': createdRooms[socket.roomIndex].playerObjects        
                });
            }
            
                            
        });


        //set the chosen action

        socket.on('setPlayerAction', function(userAction){                  //Übergabe von Aktionen der Spieler von Clients (Mehrere in Variablen in einer userAction)
            
            socket.roomIndex = getRoomIndex(socket.roomcode);   
            
            for(i=0; i < createdRooms[socket.roomIndex].playerObjects.length; i++){
                if(createdRooms[socket.roomIndex].playerObjects[i].name===userAction.actionUsername){
                    
                    if (userAction.action == 0){                            //action shoot
                    
                        if (userAction.attacktype == 1){                    //shoot shotgun when shooting
                            createdRooms[socket.roomIndex].playerObjects[i].shootShotgun();
                        }
                        else if (userAction.attacktype==2){                 //shoot rifle when shooting
                            createdRooms[socket.roomIndex].playerObjects[i].shootRifle();
                        }
                        else if (userAction.attacktype==3){                 //shoot pistol when shooting
                            createdRooms[socket.roomIndex].playerObjects[i].shootPistol();
                        } else {
                            createdRooms[socket.roomIndex].playerObjects[i].reload();
                        }
                    } else if(userAction.action ==1){                       //action reload
                        createdRooms[socket.roomIndex].playerObjects[i].reload();
                    }
                    else{                                                   //action defend
                        createdRooms[socket.roomIndex].playerObjects[i].defend();
                    }
                    createdRooms[socket.roomIndex].playersReadyForNextRound=0;     
                    break;                 
                }

            }
   
        });

        //client has chosen action

        socket.on('actionOnClientChosen', function(readyUser){

            socket.roomIndex = getRoomIndex(socket.roomcode);            

            readyUsername = readyUser.username;
            userAlreadyInArray=false;       
            for(i=0; i<createdRooms[socket.roomIndex].usersChosenAction.length; i++){
                if(createdRooms[socket.roomIndex].usersChosenAction[i]==readyUsername){
                    userAlreadyInArray=true;
                    break;
                }
            }
            if (userAlreadyInArray==false){
                createdRooms[socket.roomIndex].usersChosenAction.push(readyUsername);
                console.log(readyUsername + ' has chosen his action');
            }            

            if(createdRooms[socket.roomIndex].usersChosenAction.length===createdRooms[socket.roomIndex].playerObjects.length && createdRooms[socket.roomIndex].playerObjects.length >= createdRooms[socket.roomIndex].minUsers){
                
                createdRooms[socket.roomIndex].allUsersHaveChosenAction=true;
                io.in(createdRooms[socket.roomIndex].roomcode).emit('allUsersHaveChosenAction');
                createdRooms[socket.roomIndex].usersChosenAction=[]; 
                createdRooms[socket.roomIndex].allUsersHaveChosenAction=false;
                
            
            }

        });
                
        //Spiellogik - Ingame
        //check all actions in this room, after everyone acknowledged here, the last starts the check for the whole room
        socket.on('roundCheckActions', function(){

            socket.roomIndex = getRoomIndex(socket.roomcode);

            createdRooms[socket.roomIndex].playersReadyForNextRound+=1;            
            
            if(createdRooms[socket.roomIndex].playersReadyForNextRound==createdRooms[socket.roomIndex].playerObjects.length){
                    
                createdRooms[socket.roomIndex].playersReadyForNextRound=0;                

                io.in(createdRooms[socket.roomIndex].roomcode).emit('startAnimation', {
                    'players': createdRooms[socket.roomIndex].playerObjects
                });


                //Auswertung der Übergaben von Clients (Berechnung Schaden und Spielverlauf)

                if (createdRooms[socket.roomIndex].playerObjects[0].getAttack()>createdRooms[socket.roomIndex].playerObjects[1].getAttack() && !createdRooms[socket.roomIndex].playerObjects[1].getDefense()){
                    createdRooms[socket.roomIndex].playerObjects[1].looseLife((createdRooms[socket.roomIndex].playerObjects[0].getAttack()-createdRooms[socket.roomIndex].playerObjects[1].getAttack()));
                }

                else if (createdRooms[socket.roomIndex].playerObjects[1].getAttack()>createdRooms[socket.roomIndex].playerObjects[0].getAttack() && !createdRooms[socket.roomIndex].playerObjects[0].getDefense()){
                    createdRooms[socket.roomIndex].playerObjects[0].looseLife((createdRooms[socket.roomIndex].playerObjects[1].getAttack()-createdRooms[socket.roomIndex].playerObjects[0].getAttack()));
                }

                else {
                    socket.broadcast.emit('textMessage', "Nichts passiert.");
                }

                //Check if Players died this round
                
                for(i=0; i < createdRooms[socket.roomIndex].playerObjects.length; i++){
                    if (createdRooms[socket.roomIndex].playerObjects[i].getLives()==0){
                        createdRooms[socket.roomIndex].usersDead.push(createdRooms[socket.roomIndex].playerObjects[i]);
                        createdRooms[socket.roomIndex].playerObjects[i].setDead();
                        console.log(createdRooms[socket.roomIndex].playerObjects[i].name + ' died!');                                        
                    }
                }

                //check if only one player is still alive to end the game, if so, winner and loosers will be filled and clients sent to endscreen
                if(createdRooms[socket.roomIndex].usersDead !== undefined){
                    if(createdRooms[socket.roomIndex].playerObjects.length - createdRooms[socket.roomIndex].usersDead.length===1){                        
                        for(i=0; i < createdRooms[socket.roomIndex].playerObjects.length; i++){
                            if (createdRooms[socket.roomIndex].playerObjects[i].alive){
                                createdRooms[socket.roomIndex].winner=createdRooms[socket.roomIndex].playerObjects[i]; 
                                console.log(createdRooms[socket.roomIndex].winner.name + ' hat gewonnen!!!');
                            }else{
                                console.log(createdRooms[socket.roomIndex].playerObjects[i].name + 'lost')
                                createdRooms[socket.roomIndex].loosers.push(createdRooms[socket.roomIndex].playerObjects[i]);
                            }
                                                                
                            
                        }
                        io.in(createdRooms[socket.roomIndex].roomcode).emit('endGame', { //send result to clients
                            'finishedRoom': createdRooms[socket.roomIndex]        
                        });                   
                    }
                }

                resetUserAttributes(socket.roomIndex);                        

                //after round, refer to next round
                
                io.in(createdRooms[socket.roomIndex].roomcode).emit('nextRound', {
                    'players': createdRooms[socket.roomIndex].playerObjects    
                });
            }
        });            

        //Der User hat sich disconnected
    
        socket.on('disconnect', function(){     
            
            //Löschen der User aus Connected Users

            for (let i = 0; i < loggedInUsers.length; i++) {
                if (loggedInUsers[i] === socket.username) {
                    loggedInUsers.splice(i, 1);
                }
            }



            //Löschen der User aus dem Roomobjekt, wenn leer, Raum löschen

                for (let i = 0; i < createdRooms.length; i++) {
                    if(createdRooms[i].roomcode==socket.roomcode){
                        for (let j = 0; j < createdRooms[i].playerObjects.length; j++) {
                            if (createdRooms[i].playerObjects[j].name === socket.username) {

                                createdRooms[i].playerObjects[j].setDead();
                                createdRooms[i].usersDead.push(createdRooms[i].playerObjects[j]);
                                

                                if(createdRooms[i].playerObjects.length - createdRooms[i].usersDead.length===1){  
                                    for(k=0; i < createdRooms[i].playerObjects.length; k++){
                                        if (createdRooms[i].playerObjects[k].alive){
                                            createdRooms[i].winner=createdRooms[i].playerObjects[k]; 
                                            console.log(createdRooms[i].winner.name + ' hat gewonnen!!!');
                                        }else{
                                            console.log(createdRooms[i].playerObjects[k].name + ' lost');
                                            createdRooms[i].loosers.push(createdRooms[i].playerObjects[k]);
                                        }
                                    }
                                    createdRooms[i].playerObjects.splice(0, createdRooms[i].playerObjects.length);
                                    
                                    io.in(createdRooms[i].roomcode).emit('endGame', { //send result to clients
                                        'finishedRoom': createdRooms[i]        
                                    });
                                }
                                
                                if (createdRooms[i].playerObjects.length > 0) {
                                    io.to(createdRooms[i].roomcode).emit('updateUsers', createdRooms[i]);
                                }
                                else {
                                    console.log('Room ' + createdRooms[i].roomcode + ' is empty now and has been deleted!');
                                    createdRooms.splice(i, 1);
                                }
                                break;          
                            }
                        }
                    }
                }

                if (socket.username!==undefined){
                    console.log(socket.username + ' disconnected from Room');
                }
                
        });

    });

}