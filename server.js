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
const socketScript = require(__dirname + '/socketIO.js');
socketScript.initializeSocket(http);
createdRooms=[];

//Playerklasse einbinden

const Player = require(__dirname + '/player.js');
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
        let gravURL = gravatar.url(mail, { s: '200', r: 'pg', d: 'monsterid' });

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

app.post('/joinGame', (request, response) => {
    roomcode = request.body.roomcode;   

    // Look for the requested room
    for (let i = 0; i < createdRooms.length; i++) {
        if (createdRooms[i].roomcode === roomcode) {
            request.session.roomcode = roomcode;
            console.log("Requested lobby was found.");
            console.log(request.session.username + " joins the Room " + request.session.roomcode)
            break;
        }
    }

    // If the room was found
    if (request.session.roomcode) {
        response.redirect("/game");
    }
    else {
        console.log("Requested lobby was not found");        
        response.redirect("/");
    }
    
    response.redirect('/game');
});

app.post('/createGame', (request, response) => {
    roomcode = randomstring.generate({
        length: 5,
        charset: 'alphanumeric'
    });
    room = {
        'roomcode': roomcode,
        'users': []
    };
    createdRooms.push(room);
    request.session.roomcode = roomcode;
    console.log(request.session.username + " created the Room " + request.session.roomcode)
      
    response.redirect('/game');
});

// Logout logik implementieren!

app.get('/logout', (request, response) => {
    delete request.session.authenticated;
    delete request.session.username;
    delete request.session.roomcode;
    // Wenn Error nicht = Null gab es eine Fehlermeldung beim Logout
    error = null;
    response.redirect('/');
}); 


// verweis auf Impressum 
app.get('/impressum', (request, response) => {
    response.render( 'impressum');
});


// verweis auf Game 
app.get('/game', (request, response) => {
    username = request.session.username;
    gravURL = request.session.gravURL;    
    response.render( 'game', {'username': username, 'roomcode': request.session.roomcode, 'gravURL': gravURL});
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
