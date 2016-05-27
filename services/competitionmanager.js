/*jshint node: true, esnext: true*/
'use strict';
var express = require("express"),
    db = require('../db/database.js'),
    mongoose = require('mongoose'),
    router = express.Router();

router.post('/addCompetition', (req, res) => {
    
    let meta = req.body.meta,
        group = req.body.group;
    
    if(meta.name === undefined || 
       meta.startDate === undefined || 
       meta.arbittersCount === undefined ||
       group.name === undefined ||
       group.gender === undefined ||
       group.horses.length === 0 ||
       group.arbiters.length === 0){
        
        res.sendStatus(400);
    }
    let competition = new db.Competition(
            {
                meta: req.body.meta,
                group: req.body.group
            });
    competition.save((err) => {
      
        if(err)
            res.status(400).json(err);
        else
            res.status(200).json(competition);  
     });
});
router.delete('/deleteCompetition', (req, res) => {
    
    console.log(req.body.id);
    if(req.body.id === undefined){
        
        res.status(400).send('No content');
    }
    db.Competition.findByIdAndRemove(req.body.id, (err) => {
        if(err)
            res.status(400).json(err);
        else
            res.status(200);  
    });
});

router.get('/findCompetitionById/:id', (req, res) => {
    if(req.param('id') === undefined){
        
        res.status(400).send('No content');
    }
    
    db.Competition.findById(req.param('id'), (err, found) => {
       
        if(err)
            res.status(400).json(err);
        else
            res.status(200).json(found);  
    });
});
router.put('/updateCompetition', (req, res) => {
    
    let meta = req.body.meta,
        group = req.body.group;
    
    if(meta.name === undefined || 
       meta.startDate === undefined || 
       meta.arbittersCount === undefined ||
       group.name === undefined ||
       group.gender === undefined ||
       group.horses.length === 0 ||
       group.arbiters.length === 0){
        
        res.sendStatus(400);
    }

    db.Competition.findById(req.body.id, (err, found) => {
       
        found.meta = req.body.meta;
        found.group = req.body.group;

        found.save((err) => {
        
            if(err)
                res.status(400).json(err);
            else
                res.status(200).json(found); 
        });
        
    });
});

module.exports = router;
