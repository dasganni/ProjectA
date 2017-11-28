exports.initializeSocket = function(http){
    const io = require('socket.io')(http);  

    let PlayerClassExport = require(__dirname + '/player.js');
    let Player= PlayerClassExport.Player;
    let userAlreadyInArray = false;

    //socket

    io.on('connection', function(socket){
        
        socket.on('gameConnect', function(data){
            socket.roomcode = data.roomcode;
            socket.username = data.username;
            socket.gravURL = data.gravURL;

            socket.roomIndex = getRoomIndex(socket.roomcode);
            
            createdRooms[socket.roomIndex].users.push(socket.username);
            socket.join(createdRooms[socket.roomIndex].roomcode); 
            console.log(socket.username + " connected to the Room " + createdRooms[socket.roomIndex].roomcode);
            io.in(createdRooms[socket.roomIndex].roomcode).emit('connectedToRoom', {room: createdRooms[socket.roomIndex]});  
            io.in(createdRooms[socket.roomIndex].roomcode).emit('updateUsers', {room: createdRooms[socket.roomIndex]});
               
            if (createdRooms[socket.roomIndex]==undefined){
                socket.emit('backToLobby');
            }else{
                let player = new Player(socket.username);
                createdRooms[socket.roomIndex].playerObjects.push(player);            
            }
            

            
            
        });  

        //check the ready users

        socket.on('readyClicked', function(readyUser){

            socket.roomIndex = getRoomIndex(socket.roomcode);            

            readyUsername = readyUser.username;
            createdRooms[socket.roomIndex].usersReady.push(readyUsername);
            console.log(readyUsername + ' is ready');
                        

            if(createdRooms[socket.roomIndex].usersReady.length===createdRooms[socket.roomIndex].users.length && createdRooms[socket.roomIndex].users.length >= createdRooms[socket.roomIndex].minUsers){
                players= createdRooms[socket.roomIndex].playerObjects;
                createdRooms[socket.roomIndex].playersReadyForNextRound=0;
                io.in(createdRooms[socket.roomIndex].roomcode).emit('startGame', {
                    players: createdRooms[socket.roomIndex].playerObjects
                });               
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

            if(createdRooms[socket.roomIndex].usersChosenAction.length===createdRooms[socket.roomIndex].users.length && createdRooms[socket.roomIndex].users.length >= createdRooms[socket.roomIndex].minUsers){
                
                createdRooms[socket.roomIndex].allUsersHaveChosenAction=true;
                io.in(createdRooms[socket.roomIndex].roomcode).emit('allUsersHaveChosenAction');
                createdRooms[socket.roomIndex].usersChosenAction=[]; 
                createdRooms[socket.roomIndex].allUsersHaveChosenAction=false;
                
            
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
                        else if (userAction.attacktype==3){                                               //shoot pistol when shooting
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

        //game started

        socket.on('gameStarted', function(){

            socket.roomIndex = getRoomIndex(socket.roomcode);
            
            //send playerobjects to the clients every round

            createdRooms[socket.roomIndex].playersReadyForNextRound+=1;

            if(createdRooms[socket.roomIndex].playersReadyForNextRound==createdRooms[socket.roomIndex].users.length){
                createdRooms[socket.roomIndex].playersReadyForNextRound=0;
                
                io.in(createdRooms[socket.roomIndex].roomcode).emit('nextRound', {
                    'players': createdRooms[socket.roomIndex].playerObjects        
                });
            }
            
                            
        });

        
        //Spiellogik - Ingame

        socket.on('roundCheckActions', function(){

            socket.roomIndex = getRoomIndex(socket.roomcode);

            createdRooms[socket.roomIndex].playersReadyForNextRound+=1;            
            
            if(createdRooms[socket.roomIndex].playersReadyForNextRound==createdRooms[socket.roomIndex].users.length){
                    
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
                        createdRooms[socket.roomIndex].usersDead.push(createdRooms[socket.roomIndex].playerObjects[i].name);
                        createdRooms[socket.roomIndex].playerObjects[i].setDead();
                        console.log(createdRooms[socket.roomIndex].playerObjects[i].name + ' died!');                                        
                    }
                }

                if(typeof createdRooms[socket.roomIndex].usersDead !== 'undefined'){
                    if(createdRooms[socket.roomIndex].usersDead.length - createdRooms[socket.roomIndex].playerObjects.length===1){
                        for(i=0; i < createdRooms[socket.roomIndex].playerObjects.length; i++){
                            if (createdRooms[socket.roomIndex].playerObjects[i].getLives()>0){
                                let winner;
                                winner=createdRooms[socket.roomIndex].playerObjects[i]; 
                                console.log(winner.name + ' hat gewonnen!!!');
                                gameNotFinished=false;
                            }
                                                                
                            
                        }
                    }
                }

                resetUserAttributes(socket.roomIndex);                        

                //createdRooms[socket.roomIndex]= createdRooms[socket.roomIndex];

                createdRooms[socket.roomIndex].playersReadyForNextRound=0;
                
                io.in(createdRooms[socket.roomIndex].roomcode).emit('nextRound', {
                    'players': createdRooms[socket.roomIndex].playerObjects    
                });
            }
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

                if (socket.username!==undefined){
                    console.log(socket.username + ' disconnected from Room');
                }
                
        });

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


    });

}