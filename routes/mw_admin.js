/*jshint node: true, esnext: true*/
'use strict';

var express = require('express'),
    horseManager = require('../services/horsemanager.js'),
    arbiterManager = require('../services/arbitermanager.js'),
    competitionManager = require('../services/competitionmanager.js'),
    router = express.Router();


router.get('/', (req, res) => {
     res.header('Content-Type', 'text/html; charset=utf-8');
     res.render('admin', {
        title: 'Admin'
     });
});

router.use('/', horseManager );
router.use('/', arbiterManager );
router.use('/', competitionManager );

module.exports = router;
