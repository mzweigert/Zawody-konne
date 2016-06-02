/*jshint node: true, esnext: true*/
'use strict';
var express = require("express"),
    db = require('../db/database.js'),
    mongoose = require('mongoose'),
    router = express.Router();

router.get('/getAllHorses', (req, res) => {

    db.Horse.find({}, (err, horses) => {

        if(err)
            res.status(404).json(err);
        else
            res.status(200).json(horses); 
    });
});
router.post('/addHorse', (req, res) => {

    let body = req.body;
    if(!body.name ||
       !body.gender ||
       !body.breeder){
        return res.status(400).send('Uzupełnij wszystkie pola!');
    }

    if(body.name.length > 15 || body.name.length < 2){
        return res.status(400).send('Nazwa musi miec minimum 2 znaki i maksimum 15.');
    }
    if(body.breeder.length > 30 || body.breeder.length < 5){
        return res.status(400).send('Nazwa musi miec minimum 5 znaki i maksimum 30.');
    }
    if(body.gender !== 'Klacz' && body.gender !== 'Ogier'){
        return res.status(400).send('Koń może być klaczą albo ogierem');
    }
    
    let horse = new db.Horse({

        name: req.body.name,
        gender: req.body.gender,
        breeder: req.body.breeder
    });

    horse.save((err, horse) => {

        if(err)
            res.status(400).json(err);
        else
            res.status(200).json(horse);  
    });
});
router.delete('/deleteHorse', (req, res) => {

    console.log(req.body);
    if(!req.body.id){

        res.status(400).send('No content');
    }

    db.Horse.findByIdAndRemove(req.body.id, (err) => {
        if(err)
            res.status(400).json(err);
        else
            res.status(200).json({ message: 'usunięto!' });  
    });
});

router.get('/findHorseById/:id', (req, res) => {
    if(req.params.id === undefined){

        res.status(400).send('No content');
    }

    db.Horse.findById(req.params.id, (err, found) => {

        if(err)
            res.status(400).json(err);
        else
            res.status(200).json(found);  
    });
});
router.put('/updateHorse', (req, res) => {

    let body = req.body;
    if(!body.id ||
       !body.name ||
       !body.gender ||
       !body.breeder){
        return res.status(400).send('Uzupełnij wszystkie pola!');
    }

    if(body.name.length > 15 || body.name.length < 2){
        return res.status(400).send('Nazwa musi miec minimum 2 znaki i maksimum 15.');
    }
    if(body.breeder.length > 30 || body.breeder.length < 5){
        return res.status(400).send('Nazwa musi miec minimum 5 znaki i maksimum 30.');
    }

    if(body.gender !== 'Ogier' && body.gender !== 'Klacz'){
        return res.status(400).send('Koń może być klaczą albo ogierem');
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
