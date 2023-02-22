require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
var encrypt = require('mongoose-encryption');
const app = express();

mongoose.connect("mongodb://127.0.0.1:27017/secretDB", {useNewUrlParser: true});
mongoose.set("strictQuery",true);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const secretSchema = new mongoose.Schema({
    email : String,
    password : String
});


secretSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields : ["password"]});

const Secret = mongoose.model("Secret",secretSchema);

app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});


app.post("/register",function(req,res){
    const newSecret = new Secret({
        email : req.body.username,
        password : req.body.password
    });
    const username = req.body.username;
    const password = req.body.password;
    Secret.findOne({email:username,password:password},function(err,found){
        if(!err){
            if(found){
                if(found.email=== username){
                    res.redirect("/register");
                }
                }
                else{
                    newSecret.save(function(err){
                        if(!err){
                            res.redirect("/login");
                        }
                    });
                }
        }
    });
});

app.post("/login",function(req,res){
    const username = req.body.username;
    const password = req.body.password;
    Secret.findOne({email:username},function(err,found){
        if(err){
            res.send("not registered");
        }
        else{
            if(found){
                if(found.password === password){
                    res.render("secrets");
                }
                else{
                    res.redirect("/");
                }
            }
        }
    });
});


app.listen("5000",function(){
    console.log("server ON PORT:5000");
});
