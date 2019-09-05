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
var password;
var vallidID = [];
var passpairs = [];
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));
// app.use(session({
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: false
// }));


// app.use(passport.initialize());
// app.use(passport.session());
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
//   });

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

app.get('/register:videoId', function(req,res){//register route
    var id=req.params.videoId;
    console.log(id);
    if (vallidID.includes(id)){
        res.render('register',{id: id});
    } else {
        res.render("notfound");
    } 
});
app.post('/register:videoId',function(req,res){//register post route
    id=req.params.videoId;
    var inputPass=req.body.inputPassword;
    console.log(inputPass);
    var correctPass;
    console.log(passpairs);
    passpairs.forEach(function(pair){
        console.log(pair);
        console.log(pair.id);
        console.log(id);
        if (pair.id==id){
            correctPass=pair.password;
        }
    });
    console.log(correctPass);
    if(correctPass==inputPass){
        res.render('watch',{id:id,username:process.env.TURN_USERNAME,password:process.env.TURN_PASSWORD});
    } else {
        res.render('register',{id,id});
    }
});

// Login -----------------------------------------------------

app.get('/login', function(req,res){//login route
    res.render('login');
});
app.post('/login',function(req,res){//login post route
        console.log(req.body);
        password=req.body.inputPassword;
        console.log(password);
        res.redirect('/patrol'+password);

});
// Patrol ----------------------------------------------------

app.get('/patrol:password',function(req,res){//patrol route handle connection and video streaming
    password=req.params.password;
    var socketId={
        patrolId: null,
        watchId: null
    };
    madeID=false;
    const Id=makeid(8);
    vallidID.push(Id);
    // while(!madeID){//makes unique Id
    //     const Id=makeid(8);
    //     if(vallidID.indexOf(Id)=== -1){
    //         vallidID.push(Id);
    //         madeID=true;
    //     } else {
    //         Id=makeid(8);
    //     }
    // }
    var idPass={
        id: Id,
        password: password,
    }
    passpairs.push(idPass);
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
app.post('/watch', function(req,res){
    const id=req.body.patrolID;
    console.log(id);
    console.log(vallidID);
    console.log(vallidID.includes(id));
    if(vallidID.includes(id)){
        console.log("found");
        res.redirect("/register"+id);
    } else {
        console.log("notFound");
        res.render('notfound');
    }
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