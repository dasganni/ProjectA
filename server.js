//  Create - (POST)
//  Read - (GET)
//  Update - (PUT)
//  Delete - (DELETE)


// Globale variablen 
let errors = [];


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
const io = require('socket.io')(http);


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


//Index für Logik
app.get('/', (request, response) => {
    if (request.session.authenticated) {
        response.render('dashboard', {
            'username': request.session.username,
            'gravURL': request.session.gravURL
        });
    } else {
        if (errors.length==0){
            errorDummy=[];
        }
        response.render('index',{'error':errorDummy});
    }   
});

app.post('/signUpPost', (request, response) => {
    let username = request.body.username;
    let password = request.body.password;
    let confirmPassword = request.body.confirmPassword;
    let email = request.body.email;

    if (username == "" || username == undefined) {
        errors.push('Bitte einen Username eingeben.');
    } 
    if (password == "" || password == undefined) {
        errors.push('Bitte ein Passwort eingeben.');
    } 
    if (confirmPassword == "" || confirmPassword == undefined) {
        errors.push('Bitte ein Passwort zur Bestätigung eingeben.');
    } 
    if (password != confirmPassword) {
        errors.push('Die Passwörter stimmen nicht überein.');
    }
    if(email == "" || email == undefined){
        errors.push('Bitte eine Email eingeben');
    }
   if(pwPolicy.validate(password)==false){
        errors.push('Bitte folgende Password Policy beachten: <br> 1. Mindestens 8 Zeichen und Maximal 100 Zeichen <br> 2. Groß- und Kleinbuchstaben <br> 3. Mindestens eine Zahl <br> 4. Mindestens eine Sonderzeichen <br> 5. Keine Leerzeichen');
    }
   
    db.collection(DB_COLLECTION).findOne({'username': username}, (error, result) => {
        if (result != null) {
            errors.push('User existiert bereits.');
        } else {
            if (errors.length == 0) {
                const encryptedPassword = passwordHash.generate(password);
                const newUser = {
                    'username': username,
                    'password': encryptedPassword,
                    'email': email
                }
                db.collection(DB_COLLECTION).save(newUser, (error, result) => {
                    if (error) return console.log(error);
                    console.log(username + ' added to database');
                    response.redirect('/');
                });
            } else {
                
               response.render('index', {'error': errors});
            }
        } 
    });
});

app.post('/logInPost', (request, response) => {
    let username = request.body.username;
    let password = request.body.password;
    let mail;
    let loginFail;
    
    db.collection(DB_COLLECTION).findOne({'username': username}, (error, result) => {
        mail = result.email;
        //Anpasung für Avatar
        let gravURL = gravatar.url(mail, { s: '200', r: 'pg', d: '404' });

        if (error) return console.log(error);
    
        if (result == null) {
            console.log(error);
            return;
        } else {
            if (passwordHash.verify(password, result.password)) {
                request.session.authenticated = true;
                request.session.username = username;
                request.session.gravURL = gravURL;
                response.redirect('/');
                loginFail = false;
            } else {
                errors.push('Das Passwort für diesen User stimmt nicht überein.');
                console.log(error);     
                loginFail = true;           
            }
        }
    });
});

// Logout logik implementieren!
/*
app.get('/logout', (request, response) => {
    delete request.session.authenticated;
    delete request.session.username;
    response.redirect('/');
}); 
*/

// verweis auf Impressum 
app.get('/impressum', (request, response) => {
    response.render( 'impressum');
});

/*

//Klasse Player

var Player = (function () {
    function Player(name) {
        this.lives = 3;
        this.ammo = 1;
        this.attack = 0;
        this.__defend = false;
        this.name = name;
    }
    Player.prototype.shootPistol = function () {
        this.attack = 1;
        this.ammo -= 1;
        this.__defend = false;
    };
    Player.prototype.shootRifle = function () {
        this.attack = 2;
        this.ammo -= 3;
        this.__defend = false;
    };
    Player.prototype.shootShotgun = function () {
        this.attack = 3;
        this.ammo -= 5;
        this.__defend = false;
    };
    Player.prototype.reload = function () {
        this.ammo += 1;
        this.attack = 0;
        this.__defend = false;
    };
    Player.prototype.defend = function () {
        this.__defend = true;
    };
    Player.prototype.looseLife = function (x) {
        this.lives -= x;
    };
    Player.prototype.getLives = function () {
        return this.lives;
    };
    Player.prototype.getAttack = function () {
        return this.attack;
    };
    Player.prototype.getAmmo = function () {
        return this.ammo;
    };
    Player.prototype.getDefense = function () {
        return this.__defend;
    };
    Player.prototype.getName = function () {
        return this.name;
    };
}



//socket.io hört auf Ereignisse

io.on('connection', function(socket){
    
        //log logged in username
    
        socket.on('dashboardUser', function(socketUserName){
            socket.username = socketUserName;
            console.log(socket.username + ' connected');        
        });
        
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


        //Der User hat sich disconnected
    
        socket.on('disconnect', function(){
            console.log(socket.username + ' disconnected');
        });
    

      }); */