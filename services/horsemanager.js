/*jshint node: true, esnext: true*/
'use strict';
var express = require("express"),
    db = require('../db/database.js'),
    mongoose = require('mongoose'),
    router = express.Router();

router.post('/addHorse', (req, res) => {
    
    if(req.body.name === undefined || 
       req.body.gender === undefined || 
       req.body.breeder === undefined){
        
        res.sendStatus(400);
    }
    let horse = new db.Horse(
            {
                name: req.body.name,
                gender: req.body.gender,
                breeder: req.body.breeder
            });
    horse.save((err) => {
      
        if(err)
            res.status(400).json(err);
        else
            res.status(200).json(horse);  
     });
});
router.delete('/deleteHorse', (req, res) => {
    
    console.log(req.body.id);
    if(req.body.id === undefined){
        
        res.status(400).send('No content');
    }
    db.Horse.findByIdAndRemove(req.body.id, (err) => {
        if(err)
            res.status(400).json(err);
        else
            res.status(200);  
    });
});

router.get('/findHorseById/:id', (req, res) => {
    if(req.param('id') === undefined){
        
        res.status(400).send('No content');
    }
    
    db.Horse.findById(req.param('id'), (err, found) => {
       
        if(err)
            res.status(400).json(err);
        else
            res.status(200).json(found);  
    });
});
router.put('/updateHorse', (req, res) => {
    
    if(req.body.id === undefined || 
       req.body.name === undefined || 
       req.body.gender === undefined || 
       req.body.breeder === undefined){
        
        res.status(400).send('No content');
    }

    db.Horse.findById(req.body.id, (err, found) => {
       
        found.name = req.body.name;
        found.gender = req.body.gender;
        found.breeder = req.body.breeder;
        found.save((err) => {
            console.log(found);
            if(err)
                res.status(400).json(err);
            else
                res.status(200).json(found); 
        });
        
    });
});


module.exports = router;
