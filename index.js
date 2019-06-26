require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs  = require("ejs");
const mongoose = require("mongoose");
const app= express();
const session = require("express-session");
const passport= require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-find-or-create');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));


app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

mongoose.connect("mongodb://localhost:27017/plunderPatrolUserDB", {useNewUrlParser: true});
mongoose.set('useCreateIndex', true);



const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate)
const User = new mongoose.model("User", userSchema);


app.get('/', function(req,res){//home route
    res.render('home');
});

// register --------------------------------------------------

app.get('/register', function(req,res){//register route
    res.render('register');
});
app.post('/register',function(req,res){//register post route

});

// Login -----------------------------------------------------

app.get('/login', function(req,res){//login route
    res.render('login');
    console.log("hi");
});
app.post('/login',function(req,res){//login post route
    
        res.redirect('/patrol');

});
// Patrol ----------------------------------------------------

app.get('/patrol',function(req,res){
    const auth=true;
    if(auth){
        res.render('patrol')
    } else{
        res.redirect(login);
    }
})

// Guest -----------------------------------------------------

app.get('/guest', function(req,res){//guest route
    res.render('guest');
});


io.on('connection', function (socket) {
    console.log("connected");
  });
  

http.listen(3000, function(err){
    if(err){
        console.log(err);
    } else {
        console.log("Server Started on port 3000");
    }
});