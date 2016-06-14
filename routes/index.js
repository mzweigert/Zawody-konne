/*jshint node: true, esnext: true */
// poniżej użylismy krótszej (niż na wykładzie) formy
// module.exports ==> exports
var express = require('express'),
    db = require('../db/database.js'),
    competition = require('./waist/competition.js'),
    login = require('./login.js'),
    admin   = require('./admin/mw_admin.js'),
    arbiter = require('./arbiter/mw_arbiter.js'),
    router = express.Router();


var checkRole = function(role) {
  return function(req, res, next) {
    if (req.user && req.user.role === role)
      next();
    else
      res.status(401).send('Unauthorized');
  };
};

router.get('/', (req, res) => {
    res.header('Content-Type', 'text/html; charset=utf-8');

    if(req.user){
        if(req.user.role === 'arbiter')
            return res.redirect('/arbiter');
    }
     db.Competition.find({'meta.started' : true}, (err, competitions) => {
        if(err)
           return res.status(404);
         
        res.render('index', {
            title: 'Zawody konne',
            competitions: competitions
        });
    }); 
    
});

router.use('/', competition);
router.use('/login', login);
router.use('/admin', checkRole('admin'), admin);
router.use('/arbiter', checkRole('arbiter'), arbiter);

module.exports = router;