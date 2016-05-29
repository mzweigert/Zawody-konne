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
router.post('/', (req, res) => {
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
            
            req.user.role = user.role;
            if(user.role === 'admin')
                res.send('../admin');
            else if(user.role === 'arbiter')
                res.send('../arbiter');
        });
    })(req, res);

});

router.post('/signup', passport.authenticate('signup', {
    failureFlash : true 
}));


module.exports = router;