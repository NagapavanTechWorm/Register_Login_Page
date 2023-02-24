
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }));

  app.use(passport.initialize());
  app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/secretDB", {useNewUrlParser: true});
mongoose.set("strictQuery",true);

const secretSchema = new mongoose.Schema({
    email : String,
    password : String
});
secretSchema.plugin(passportLocalMongoose);

const Secret = mongoose.model("Secret",secretSchema);


passport.use(new LocalStrategy(Secret.authenticate()));
passport.use(Secret.createStrategy());
passport.serializeUser(Secret.serializeUser());
passport.deserializeUser(Secret.deserializeUser());

app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});

app.get("/register",function(req,res){
    res.render("register");
});

app.get("/secrets",function(req,res){
    res.render("secrets");
});

app.get("/logout",function(req,res){
    req.logout;
    res.redirect("/");
});

app.post("/register",function(req,res){
    Secret.register(new Secret({username:req.body.username}),req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        }
        else{
            res.redirect("/login");
        }
      });
});

app.post("/login",passport.authenticate("local",{
    successRedirect:"/secrets",
    failureRedirect:"/login"
}));


app.listen("5000",function(){
    console.log("server ON PORT:5000");
});
