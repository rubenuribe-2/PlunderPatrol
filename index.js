require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs  = require("ejs");
const mongoose = require("mongoose");
const app= express();


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended:true
}));


app.get('/', function(req,res){
    res.render('home');
});

app.listen(3000, function(err){
    if(err){
        console.log(err);
    } else {
        console.log("Server Started on port 3000");
    }
});