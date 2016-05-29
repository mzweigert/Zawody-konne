/*jshint node: true, esnext: true */

var passport = require('passport'),
    bCrypt   = require('bcrypt-nodejs'),
    db = require('../db/database.js');

var LocalStrategy = require('passport-local').Strategy;
// Konfiguracja passport.js
passport.serializeUser(function(user, done) {
    done(null, user._id);
});
 
passport.deserializeUser(function(id, done) {
    db.User.findById(id, 'role firstname lastname', (err, user) => {
        done(err, user);
    });
});
passport.use('login', new LocalStrategy({
    passReqToCallback : true
    }, (req, username, password, done) => {


        db.User.findOne({ 'username' : username }, 'username password role', (err, user) => {
            if (err)
                return done(err);
            if(!user){
                return done(null, false, { message: 'Nie znaleziono użytkownika o loginie: ' + username });
            }
            
            if(!isValidPassword(user, password)) {
                return done(null, false, { message: 'Nieprawidłowe hasło.' } );
            }
            return done(null, user);
        });
        
    }
));

passport.use('signup', new LocalStrategy({
    passReqToCallback : true
  },
  function(req, username, password, done) {
    'use strict';
    let findOrCreateUser = () => {
      // find a user in Mongo with provided username
      db.User.findOne({'username':username}, (err, user) => {
        // In case of any error return
        if (err){
          console.log('Error in SignUp: '+err);
          return done(err);
        }
        // already exists
        if (user) {
          console.log('User already exists');
          return done(null, false, 
             req.flash('message','User Already Exists'));
        } else {
          // if there is no user with that email
          // create the user
          var newUser = new db.User();
          // set the user's local credentials
            console.log(req.body.lastname);
          newUser.username = username;
          newUser.password = createHash(password);
          newUser.firstname = req.body.firstname;
          newUser.lastname = req.body.lastname;
          newUser.role = req.body.role;
          // save the user
          newUser.save(function(err) {
            if (err){
              console.log('Error in Saving user: '+err);  
              throw err;  
            }
            console.log('User Registration succesful');    
            return done(null, newUser);
          });
        }
      });
    };
     
    // Delay the execution of findOrCreateUser and execute 
    // the method in the next tick of the event loop
    process.nextTick(findOrCreateUser);
  }));

var isValidPassword = function(user, password){

    return bCrypt.compareSync(password, user.password);
};

var createHash = function(password){
 return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

module.exports = passport;
