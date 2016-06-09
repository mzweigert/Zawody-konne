/*jshint node: true, esnext: true*/
'use strict';

var express = require('express'),
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
    res.render('admin/horsecrud');
});

router.get('/user', (req, res) => {
    res.header('Content-Type', 'text/html; charset=utf-8');
    res.render('admin/usercrud');
});

router.get('/competition', (req, res) => {
    res.header('Content-Type', 'text/html; charset=utf-8');
    res.render('admin/competitioncrud');
});


router.use('/horse', horseManager );
router.use('/user', userManager );
router.use('/competition', competitionManager );
router.use('/competition', results);
router.use('/competition', groups);
router.use('/competition', startlist);



module.exports = router;
