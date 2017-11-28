//  Create - (POST)
//  Read - (GET)
//  Update - (PUT)
//  Delete - (DELETE)


// Globale variablen 
roomExists=false;
let loggedInUsers=[];


//port
const port = 3000;

// Express init
const express = require("express");
const app = express();

// Sessions initialisieren
 const session = require('express-session');
 app.use(session({ 
     secret: 'example',
     resave: false,
     saveUninitialized: true
 }));

 //Password-Validator initialisieren

 const passwordValidator = require('password-validator');
 
 // Create a policy
 let pwPolicy = new passwordValidator();
 pwPolicy.is().min(8)                                    // Minimum length 8
 pwPolicy.is().max(100)                                  // Maximum length 100
 pwPolicy.has().uppercase()                              // Must have uppercase letters
 pwPolicy.has().lowercase()                              // Must have lowercase letters
 pwPolicy.has().symbols()                                // Must have symbols
 pwPolicy.has().digits()                                 // Must have digits
 pwPolicy.has().not().spaces()                           // Should not have spaces

// Gravatar initalisieren 

const gravatar = require('gravatar');

//socket.io initialisieren
const http = require('http').Server(app);
const socketScript = require(__dirname + '/socketIO.js');
socketScript.initializeSocket(http);
createdRooms=[];

//Playerklasse einbinden

let Player = require(__dirname + '/player.js');
//let player = new Player('name');

//Randomstring init

const randomstring = require("randomstring");


// Password Hash
const passwordHash = require('password-hash');

// body-parser init

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// ejs initialisieren

app.set("view engine", "ejs");


//database setup
const DB_COLLECTION = 'users';
const Db = require('tingodb')().Db;
const db = new Db(__dirname + '/tingodb', {});
const ObjectId = require('tingodb')().ObjectID;

// Server starten
http.listen(port, function() {
	console.log("listening to port " + port);
});


// verweis auf Styles
app.use("/styles", express.static(__dirname + '/styles'));

//verweis auf js
app.use(express.static(__dirname + "/views/js"));


//Index für Logik
app.get('/', (request, response) => {
    if (request.session.authenticated || request.session.authenticated!==undefined) {
        if (request.session.joinLobbyErrors==null || request.session.joinLobbyErrors==undefined){
            request.session.joinLobbyErrors=[];
        }
        response.render('dashboard', {
            'username': request.session.username,
            'gravURL': request.session.gravURL,
            'joinLobbyErrors': request.session.joinLobbyErrors
        });
    } else {
        if (request.session.errors==null || request.session.errors==undefined){
            request.session.errors=[];
        }
        if (request.session.loginErrors==null || request.session.loginErrors==undefined){
            request.session.loginErrors=[];
        }
        response.render('index',{'error':request.session.errors, 'loginErrors':request.session.loginErrors});
    }   
});

app.post('/signUpPost', (request, response) => {
    let username = request.body.username;
    let password = request.body.password;
    let confirmPassword = request.body.confirmPassword;
    let email = request.body.email;
    request.session.errors=[];

    if (username == "" || username == undefined) {
        request.session.errors.push('Bitte einen Username eingeben.');
    } 
    if (password == "" || password == undefined) {
        request.session.errors.push('Bitte ein Passwort eingeben.');
    } 
    if (confirmPassword == "" || confirmPassword == undefined) {
        request.session.errors.push('Bitte ein Passwort zur Bestätigung eingeben.');
    } 
    if (password != confirmPassword) {
        request.session.errors.push('Die Passwörter stimmen nicht überein.');
    }
    if(email == "" || email == undefined){
        request.session.errors.push('Bitte eine Email eingeben');
    }
    if(pwPolicy.validate(password)==false){
        request.session.errors.push('Bitte folgende Password Policy beachten: <br> 1. Mindestens 8 Zeichen und Maximal 100 Zeichen <br> 2. Groß- und Kleinbuchstaben <br> 3. Mindestens eine Zahl <br> 4. Mindestens eine Sonderzeichen <br> 5. Keine Leerzeichen');
    }
   
    db.collection(DB_COLLECTION).findOne({'username': username}, (error, result) => {
        if (result != null) {
            request.session.errors.push('User existiert bereits.');
            response.redirect('/');
            
        } else {
            if (request.session.errors.length == 0) {
                const encryptedPassword = passwordHash.generate(password);
                const newUser = {
                    'username': username,
                    'password': encryptedPassword,
                    'email': email
                }
                db.collection(DB_COLLECTION).save(newUser, (error, result) => {
                    console.log(username + ' added to database');
                    request.session.authenticated = true;
                    let gravURL = gravatar.url(email, { s: '200', r: 'pg', d: 'monsterid' });                    
                    request.session.username = username;
                    request.session.gravURL = gravURL;
                    response.redirect('/');
                });
            } else {
                
                response.redirect('/');
            }
        } 
    });
});

app.post('/logInPost', (request, response) => {
    let username = request.body.username;
    let password = request.body.password;
    let mail;
    request.session.loginErrors=[];

    db.collection(DB_COLLECTION).findOne({'username': username}, (error, result) => {
        //if (error) return console.log(error);
    
        if (result == null) {
            request.session.loginErrors=[];
            request.session.loginErrors.push('User existiert nicht');
            response.redirect('/');
        } else {
            mail = result.email;
            //Anpasung für Avatar
            let gravURL = gravatar.url(mail, { s: '200', r: 'pg', d: 'monsterid' });

            if (passwordHash.verify(password, result.password)) {
                if(loggedInUsers!==null && loggedInUsers !==undefined){
                    for(i=0; i<loggedInUsers.length; i++){
                        if(loggedInUsers[i]==result.username){
                            request.session.loginErrors.push('User ist bereits angemeldet!');
                            break;                      
                        }
                        console.log("test")
                    }
                } 
                if(request.session.loginErrors.length>=1){
                    response.redirect('/');
                }else{
                    request.session.authenticated = true;
                    request.session.username = username;
                    request.session.gravURL = gravURL;
                    loggedInUsers.push(request.session.username);
                    response.redirect('/');
                }
                
            } else {
                request.session.loginErrors=[];                
                request.session.loginErrors.push('Das Passwort für diesen User stimmt nicht überein.');
                response.redirect('/');
            }
        }
    });
});

app.post('/joinGame', (request, response) => {
    let roomIsFull = false;
    roomcode = request.body.roomcode;   

    // Look for the requested room
    for (let i = 0; i < createdRooms.length; i++) {
        if (createdRooms[i].roomcode === roomcode) {
            request.session.roomcode = roomcode;
            console.log("Requested lobby was found.");
            console.log(request.session.username + " tries to join the Room " + request.session.roomcode);
            if(createdRooms[i].users.length === createdRooms[i].userLimit){
                roomIsFull = createdRooms[i].roomFull;
            }
            else if(createdRooms[i].users.length === createdRooms[i].userLimit-1){
                createdRooms[i].roomFull=true;
            }
            break;
        }
    }

    // If the room was found
    if (request.session.roomcode) {
            
        if(roomIsFull){
            console.log("Requested lobby " + request.session.roomcode + " has reached the Userlimit");
            request.session.joinLobbyErrors=[];
            request.session.joinLobbyErrors.push("Requested Lobby " + request.session.roomcode + " is Full");
            delete request.session.roomcode;
            response.redirect('/');
            
        } else{        
        response.redirect("/game");
        }
    }
    else {
        request.session.joinLobbyErrors=[];
        request.session.joinLobbyErrors.push("Requested Lobby " + roomcode + " does not exist");
        response.redirect("/");
    }
});

app.post('/createGame', (request, response) => {
    roomcode = randomstring.generate({
        length: 5,
        charset: 'alphanumeric'
    });
    room = {
        'roomcode': roomcode,
        'users': [],
        'usersReady': [],
        'userLimit': 2,
        'roomFull': false,
        'playerObjects':[],
        'minUsers': 2,
        'usersDead': [],
        'usersChosenAction':[],
        'allUsersHaveChosenAction':false,
        'playersReadyForNextRound':0
    };
    createdRooms.push(room);
    request.session.roomcode = roomcode;
    console.log(request.session.username + " created the Room " + request.session.roomcode)
      
    response.redirect('/game');
});

// Logout logik implementieren!

app.get('/logout', (request, response) => {
    for(i=0; i<loggedInUsers.length; i++){
        if(request.session.username==loggedInUsers[i]){
            loggedInUsers.splice(i,1)            
        }
    }
    delete request.session.authenticated;
    delete request.session.username;
    
    // Wenn Error nicht = Null gab es eine Fehlermeldung beim Logout
    //error = null;
    response.redirect('/');
}); 


// verweis auf Impressum 
app.get('/impressum', (request, response) => {
    response.render( 'impressum');
});

// verweis auf Profil 
app.get('/profil', (request, response) => {
    if (request.session.authenticated || request.session.authenticated!==undefined) {

        if (request.session.updateErrors==null || request.session.updateErrors==undefined){
            request.session.updateErrors=[];
        }

        response.render('profil',{'updateErrors': request.session.updateErrors});
    }else{
        response.redirect('/');
    }
});


// verweis auf Game 
app.get('/game', (request, response) => {
    if (request.session.authenticated || request.session.authenticated!==undefined) {

        
        username = request.session.username;
        gravURL = request.session.gravURL;    
        response.render( 'game', {
            'username': username,
            'roomcode': request.session.roomcode, 
            'gravURL': gravURL
        });
            
        

    } else {
        delete request.session.roomcode;        
        response.redirect("/");
    }
});

// Nicht fertig 
// Passwort änderungen
app.post('/user/update', (request, response) => {
    
    const usernameUpdate = request.session.username;
    const oldPW = request.body.oldPass;
    const newPW = request.body.newPass;
    const repeatNewPW = request.body.newPassRepeat;
    request.session.updateErrors=[];

    if (oldPW == "" || newPW == "" || repeatNewPW == ""){
        request.session.updateErrors.push('Fill all fields');
    }
    if (newPW != repeatNewPW){
        request.session.updateErrors.push('Passwords dont match');
    }
    if(pwPolicy.validate(newPW)==false){
        request.session.updateErrors.push('Bitte folgende Password Policy beachten: <br> 1. Mindestens 8 Zeichen und Maximal 100 Zeichen <br> 2. Groß- und Kleinbuchstaben <br> 3. Mindestens eine Zahl <br> 4. Mindestens eine Sonderzeichen <br> 5. Keine Leerzeichen');
    }
    if (request.session.updateErrors.length==0){
        db.collection(DB_COLLECTION).findOne({ 'username': usernameUpdate }, (error, result) => {

            if (!passwordHash.verify(oldPW, result.password)) {
                request.session.updateErrors.push("Dein altes Passwort ist nicht korrekt!");
                response.redirect('/profil');
            }
            
            //passwords match
            else {

                db.collection(DB_COLLECTION).update(

                    { 'username': usernameUpdate },
                    { $set: { password: passwordHash.generate(newPW) } }

                );

                response.redirect('/');
            }
        });
    }else{
        response.redirect('/profil');        
    }
});

/*

// Handle 404 - Keep this as a last route
// Handle 404
app.use(function(req, res) {
    res.status(400);
    console.log('404')
    res.render('error.ejs', {title: '404: File Not Found'});
});

// Handle 500
app.use(function(error, req, res, next) {
    res.status(500);
    console.log('500')    
    res.render('error.ejs', {title:'500: Internal Server Error', error: error});
});

*/
