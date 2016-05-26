var passport = require('passport'),
    db = require('../db/database.js');

var LocalStrategy = require('passport-local').Strategy;
// Konfiguracja passport.js
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});

passport.use(new LocalStrategy(
    function (username, password, done) {
        
        db.User.findOne({ 'username' : username }, (err, found) => {
            if (err)
                return done(err);
            if(!user){
                console.log('User not found with username ' + username);
                return done(null, false, 
                           req.flash('message', 'User not found.'));
            }
            
            if(!isValidPassword(user, password)) {
                console.log('Invalid Password');
                return done(null, false, req.flash('message', 'invalid password'));
            }
        });
        return done(null, user);
    }
));

var isValidPassword = function(user, password){
  return bCrypt.compareSync(password, user.password);
}

module.exports = passport;
