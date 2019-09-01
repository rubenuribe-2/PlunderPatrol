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
var vallidID = [];
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

// mongoose.connect("mongodb://localhost:27017/plunderPatrolVideoDB", {useNewUrlParser: true});
// mongoose.connect("mongodb://localhost:27017/plunderPatrolUserDB", {useNewUrlParser: true});
// mongoose.set('useCreateIndex', true);



// const userSchema = new mongoose.Schema({
//     email: String,
//     password: String,
//     googleId: String,
//     secret: String
// });
// const videoSchema = new mongoose.Schema({
//     code: String,
//     password: String
// });



// videoSchema.plugin(passportLocalMongoose);
// videoSchema.plugin(findOrCreate);
// const Video = new mongoose.model("video", videoSchema)


// userSchema.plugin(passportLocalMongoose);
// userSchema.plugin(findOrCreate)
// const User = new mongoose.model("User", userSchema);


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

app.get('/patrol',function(req,res){//patrol route handle connection and video streaming
    var socketId={
        patrolId: null,
        watchId: null
    };
    madeID=false
    const Id=makeid(8);
    while(!madeID){//makes unique Id
        const Id=makeid(8);
        if(vallidID.indexOf(Id)=== -1){
            vallidID.push(Id);
            madeID=true;
        } else {
            Id=makeid(8);
        }
    }
    const auth=true;
    if(auth){
        res.render('patrol',{id: Id,username:process.env.TURN_USERNAME,password:process.env.TURN_PASSWORD});

        patrol=io
        .of('/'+Id)
        .on('connection', function(socket){
            
            console.log("connected to " + Id);

            //convenience function to log server messages
            function log(){
                var array = ["Message from server:"];
                array.push.apply(array,arguments);
                socket.emit('log', array);
            }

            socket.on('message', function(message){
                log('client said: ', message);
                socket.emit('message', message);
            });

            socket.on('patrol',function(patrolId){
                console.log("patrol connected to socket");
                console.log(patrolId);
                socketId.patrolId=patrolId;
                console.log("patrolID "+socketId.patrolId);
                
            });
            socket.on('candidate',function(candidate){
                socket.to(socketId.watchId).emit('candidate',candidate);
            });
            socket.on('watching',function(watchId){
                console.log('watch connected to socket');
                console.log(watchId);
                socketId.watchId=watchId;
                console.log("patrolID "+socketId.patrolId);
                socket.to(socketId.patrolId).emit('watching');
                console.log("emited");
            });
            socket.on('offer',function(offer){
                console.log("recived offer from patrol");
                //add password to database or something else that is secure
                console.log("offer.sdp: ", offer.sdp);
                socket.to(socketId.watchId).emit('offer',offer);
            });
            socket.on('answer',function(answer){
                console.log('recived answer from watch');
                socket.to(socketId.patrolId).emit('answer',answer);
            });
            socket.on('success',function(){
                socket.to(socketId.watchId).emit('success');
            });
            socket.on('message', function () { });


            socket.on('disconnect', function () {
                vallidID.splice(vallidID.indexOf(Id),1);
             });            
        });

    } else{
        res.redirect(login);
    }
})

app.get('/watch:videoId',function(req,res){
    const videoId=req.params.videoId;
    
    res.render('watch',{id:videoId,username:process.env.TURN_USERNAME,password:process.env.TURN_PASSWORD});
});


// Guest -----------------------------------------------------

app.get('/guest', function(req,res){//guest route
    res.render('guest');
});
  

http.listen(process.env.PORT || 3000, function(err){
    if(err){
        console.log(err);
    } else {
        console.log("Server Started");
    }
});

function makeid(length) {//handle making a unique ID for all of the clients
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }