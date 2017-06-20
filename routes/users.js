var express = require('express');
var router = express.Router();
var User= require('../models/user.js');
var multer=require('multer');
var uploads = multer({dest: './uploads'});
var passport= require('passport');
var LocalStrategy=require('passport-local').Strategy;
var bcrypt = require('bcryptjs');
/* GET users listing. */

router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});
router.get('/register', function(req, res, next) {
  res.render('register',{
    'title':'Register'
  });
});

router.get('/login', function(req, res, next) {
  res.render('login',{
    'title':'Login'
  });

});

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});


passport.use(new LocalStrategy(function(username,password,done){

User.getUserByUsername(username,function(err,user){
  if(err)
     done(err);
  if(!user)
  {
    console.log('Unknown User..');
    return done(null,false,{message:'unknown user'});
  }
  User.comparePassword(password,user.password,function(err,res)
  {
    if(err)
      throw err;
    if(res)
      return done(null,user);
    else{
      console.log('Invalid password..');
      return done(null,false,{message:'Invalid password'})
    }
     
  });

      

});
}));

router.post('/login',passport.authenticate('local',{failuerRedirect:'/users/login',failuerFlash:'Invalid username or password'}),function(req,res){
  console.log("Authemtication successful");
  req.flash('success','You are now logged in..');
  res.redirect('/');
});

router.post('/register', uploads.single('profileimage'), function(req, res, next) {
  var name=req.body.name;
  var email=req.body.email;
  var username=req.body.username;
  var password=req.body.password;
  var password2=req.body.password2;


//check image
  if(req.file){
  console.log("Uploading File...");
  var profileimageoriginalname=req.files.profileimage.oiginalname;
  var profileimagename= req.files.profileimage.name; 
  var profileimagemime= req.files.profileimage.mimetype;
  var profileimagepath= req.files.profileimage.path;  
  var profileimageext= req.files.profileimage.extension; 
  var profileimagesize= req.files.profileimage.size; 
  }
  else
  {
  //default image
    var profileimagename='noimage.img';
  }
  //form validation
  req.checkBody('name','Name required').notEmpty();
  req.checkBody('email','email required').notEmpty();
  req.checkBody('email','not valid email').isEmail();
  req.checkBody('username','username required').notEmpty();
  req.checkBody('password','password required').notEmpty();
  req.checkBody('password2','password not match').equals(req.body.password);
  var errors=req.validationErrors();
  if(errors)
  {
    res.render('register',{
      errors:errors,
      name:name,
      email:email,
      password:password,
      password2:password2,
      username:username
    });
  }
  else
  {
  
    var newuser=new User(
      {
        name:name,
      email:email,
      username:username,
      password:password,
      profileimage:profileimagename

      }
    );
   
    User.createUser(newuser, function(err,user) {
      if(err)
        throw err;
      console.log(user);
    });
    req.flash('success','you are now registered !');
    res.location('/');
    res.redirect('/');
  }
});

router.get('/logout',function(req,res){
  req.logout();
  req.flash('success','you have logged out');
  res.redirect('/users/login');
});
module.exports = router;
