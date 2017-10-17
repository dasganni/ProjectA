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
app.listen(port, function() {
	console.log("listening to port" + port);
});


// verweis auf Styles
app.use("/styles", express.static(__dirname + '/styles'));


//Index für Logik
app.get('/', (request, response) => {
    if (request.session.authenticated) {
        response.render('dummy', {'username': request.session.username});
    } else {
        response.render('index');
    }   
});

app.post('/signUpPost', (request, response) => {
    let username = request.body.username;
    let password = request.body.password;
    let confirmPassword = request.body.confirmPassword;
    let email = request.body.email;
});

app.post('/logInPost',(request, response) => {

});


// verweis auf Impressum 
app.get('/impressum', function(req, res) {
    res.render( 'impressum');
});