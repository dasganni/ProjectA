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
const DB_COLLECTION = "users";
require('fs').mkdir(__dirname + '/tingodb', (err) => {});
const db = require('tingodb')().Db;
const database = new db(__dirname + '/tingodb', {});
const ObjectID = require('tingodb')().ObjectID;


// Server starten
app.listen(port, function() {
	console.log("listening to port" + port);
});

//Index für Logik

app.get('/', function(req, res){
	res.render('index');
});
