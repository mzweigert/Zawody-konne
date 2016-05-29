/*jshint node: true, esnext: true*/
'use strict';

var express = require('express'),
    horseManager = require('../services/horsemanager.js'),
    userManager = require('../services/usermanager.js'),
    competitionManager = require('../services/competitionmanager.js'),
    router = express.Router();

var checkRole = function(role) {
  return function(req, res, next) {
    if (req.user && req.user.role === role)
      next();
    else
      res.status(401).send('Unauthorized');
  };
};

router.get('/', checkRole('admin'), (req, res) => {
    
    res.header('Content-Type', 'text/html; charset=utf-8');
    res.render('admin/admin', {
        firstname: req.user.firstname,
        lastname: req.user.lastname
    });
});

router.get('/horse', checkRole('admin'), (req, res) => {
    res.header('Content-Type', 'text/html; charset=utf-8');
    res.render('admin/horsecrud');
});

router.get('/user', checkRole('admin'), (req, res) => {
    res.header('Content-Type', 'text/html; charset=utf-8');
    res.render('admin/usercrud');
});

router.use('/', checkRole('admin'), horseManager );
router.use('/', checkRole('admin'), userManager );
router.use('/', checkRole('admin'), competitionManager );

module.exports = router;
