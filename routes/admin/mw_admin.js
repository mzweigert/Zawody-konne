/*jshint node: true, esnext: true*/
'use strict';

var express = require('express'),
    db = require('../../db/database.js'),
    horseManager = require('../../services/horsemanager.js'),
    userManager = require('../../services/usermanager.js'),
    competitionManager = require('../../services/competitionmanager.js'),
    startlist = require('./startlist.js'),
    groups = require('./groups.js'),
    results = require('./results.js'),
    io = require('../../server.js').io,
    router = express.Router();


router.get('/', (req, res) => {

    res.header('Content-Type', 'text/html; charset=utf-8');
    res.render('admin/admin', {
        firstname: req.user.firstname,
        lastname: req.user.lastname
    });
});

router.get('/horse', (req, res) => {
    res.header('Content-Type', 'text/html; charset=utf-8');
    db.Horse.find({}, (err, horses) => {
        if(err)
            return res.status(404).send('Nie mozna odnalezc koni');
        
         return res.render('admin/horsecrud', { horses });
    });
  
});

router.get('/user', (req, res) => {
    res.header('Content-Type', 'text/html; charset=utf-8');
    db.User.find({}, 'username password firstname lastname role', (err, users) => {
        if(err)
            return res.status(404).send('Nie mozna odnalezc uzytkownikow');
        
         return res.render('admin/usercrud', { users });
    });
  
});

router.get('/competition', (req, res) => {
    res.header('Content-Type', 'text/html; charset=utf-8');

    db.Competition.find({}, 'meta startList', (err, competitions) => {
        if(err)
            return res.status(404).send('Nie mozna odnalezc zawodów');
      

         return res.render('admin/competitioncrud', { competitions });
    });

});


router.use('/horse', horseManager );
router.use('/user', userManager );
router.use('/competition', competitionManager );
router.use('/competition', results);
router.use('/competition', groups);
router.use('/competition', startlist);



module.exports = router;
