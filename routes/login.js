/*jshint node: true, esnext: true */
// poniżej użylismy krótszej (niż na wykładzie) formy
// module.exports ==> exports
var express = require('express'),
    passport = require('../config/passportconfig.js'),
    router = express.Router();

router.get('/', (req, res) => {
    res.header('Content-Type', 'text/html; charset=utf-8');
    res.render('login');
});
router.post('/',(req, res) => {
    passport.authenticate('login', (err, user, info) => {
        if (err) { 
 
            return res.send(info).status(400); 
        }
        if (!user) { 
      
            return res.status(401).send(info.message); 
        }
        req.logIn(user, (err) => {
      
            if (err) { 
                return res.status(401).send(err); 
            }
            return res.send(user);
        });
    })(req, res);

});

router.post('/signup', (req, res) => { 

    /*passport.authenticate('signup', {
    successRedirect: '/home',
    failureRedirect: '/signup',
    failureFlash : true 
    });*/
});


module.exports = router;