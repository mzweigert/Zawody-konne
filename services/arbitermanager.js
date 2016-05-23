/*jshint node: true, esnext: true*/
'use strict';
var express = require("express"),
    db = require('../db/database.js'),
    mongoose = require('mongoose'),
    router = express.Router();

router.post('/addArbiter', (req, res) => {
    
    if(req.body.name === undefined || 
       req.body.surname === undefined || 
       req.body.idLog === undefined){
        
        res.sendStatus(400);
    }
    let arbiter = new db.Arbiter(
            {
                name: req.body.name,
                surname: req.body.surname,
                idLog: req.body.idLog
            });
    arbiter.save((err) => {
      
        if(err)
            res.status(400).json(err);
        else
            res.status(200).json(arbiter);  
     });
});
router.delete('/deleteArbiter', (req, res) => {
    
    console.log(req.body.id);
    if(req.body.id === undefined){
        
        res.status(400).send('No content');
    }
    db.Arbiter.findByIdAndRemove(req.body.id, (err) => {
        if(err)
            res.status(400).json(err);
        else
            res.status(200);  
    });
});

router.get('/findArbiterById/:id', (req, res) => {
    if(req.param('id') === undefined){
        
        res.status(400).send('No content');
    }
    
    db.Arbiter.findById(req.param('id'), (err, found) => {
       
        if(err)
            res.status(400).json(err);
        else
            res.status(200).json(found);  
    });
});
router.put('/updateArbiter', (req, res) => {
    
    if(req.body.id === undefined || 
       req.body.name === undefined || 
       req.body.surname === undefined || 
       req.body.idLog === undefined){
        
        res.status(400).send('No content');
    }

    db.Arbiter.findById(req.body.id, (err, found) => {
       
        found.name = req.body.name;
        found.surname = req.body.surname;
        found.idLog = req.body.idLog;
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
