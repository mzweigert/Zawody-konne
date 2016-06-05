/*jshint node: true, esnext: true */
// poniżej użylismy krótszej (niż na wykładzie) formy
// module.exports ==> exports
var express = require('express'),
    db = require('../db/database.js'),
    competition = require('./competition.js'),
    login = require('./login.js'),
    admin   = require('./admin/mw_admin.js'),
    arbiter = require('./mw_arbiter.js'),
    router = express.Router();


router.get('/', (req, res) => {
    res.header('Content-Type', 'text/html; charset=utf-8');

     db.Competition.find({}, (err, competitions) => {
        if(err)
           return res.status(404);
        
        res.render('index', {
            title: 'Zawody konne',
            competitions: competitions
            
        });
    }); 
    
});

router.use('/competition', competition);
router.use('/login', login);
router.use('/admin', admin);
router.use('/arbiter', arbiter.index);

module.exports = router;