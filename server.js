//  Create - (POST)
//  Read - (GET)
//  Update - (PUT)
//  Delete - (DELETE)

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

//socket.io hört auf Ereignisse

io.on('connection', function(socket){

    //log logged in username

    socket.on('dashboardUser', function(socketUserName){
        socket.username = socketUserName;
        console.log(socket.username + ' connected');        
    });


    //Der User hat sich disconnected

    socket.on('disconnect', function(){
        console.log(socket.username + ' disconnected');
    });


  });



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
        response.render('index');
    }   
});

app.post('/signUpPost', (request, response) => {
    let username = request.body.username;
    let password = request.body.password;
    let confirmPassword = request.body.confirmPassword;
    let email = request.body.email;

    let errors = [];
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
                
               response.render('errors', {'error': errors});
            }
        } 
    });
});

app.post('/logInPost', (request, response) => {
    let username = request.body.username;
    let password = request.body.password;
    let mail;

    let errors = [];
    
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
            } else {
                errors.push('Das Passwort für diesen User stimmt nicht überein.');
                console.log(error);                
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