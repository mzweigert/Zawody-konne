/*jshint node: true, esnext: true*/
'use strict';
var express = require("express"),
    db = require('../db/database.js'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    async = require('async'),
        router = express.Router();


router.get('/getAllCompetitions', (req, res) => {

    db.Competition.find({}, (err, competitions) => {

        if(err)
            res.status(404).json(err);
        else
            res.status(200).json(competitions); 

    });
});

router.post('/addCompetitionMeta', (req, res) => {

    let meta = req.body.meta;

    if(!meta){
        return res.status(400).send("Dodaj meta dane!");
    }
    if(!meta.name ||
       !meta.startDate ||
       !meta.arbitersCount ||
       !meta.ratesType){

        return res.status(400).send("Uzupełnij pola!");
    }
    if(meta.arbitersCount < 5){
        return res.status(400).send("Liczba sędziów powinna wynosić minimum 5!");
    }

    let competition = new db.Competition({
        meta: meta
    });

    competition.save((err) => {
        if(err)
            res.status(400).json(err);
        else
            res.status(200).json(competition);  
    });

});
router.put('/updateCompetitionMeta', (req, res) => {

    let meta = req.body.meta;

    if(!meta){
        return res.status(400).send("Dodaj meta dane!");
    }
    if(!meta.id ||
       !meta.name ||
       !meta.startDate ||
       !meta.arbitersCount ||
       !meta.ratesType){

        return res.status(400).send("Uzupełnij pola!");
    }
    if(meta.arbitersCount < 5){
        return res.status(400).send("Liczba sędziów powinna wynosić minimum 5!");
    }

    db.Competition.findById(meta.id, (err, found) => {

        if(err)
            return res.status(400).json(err);

        found.meta = meta;
        found.save((err) => {
            if(err)
                res.status(400).json(err);
            else
                res.status(200).json(found); 
        });

    });
});

router.get('/findCompetitionById/:id', (req, res) => {
    if(req.param('id') === undefined){

        res.status(400).send('No content');
    }

    db.Competition.findById(req.params.id, (err, found) => {

        if(err)
            res.status(400).json(err);
        else
            res.status(200).json(found);  
    });
});
router.delete('/deleteCompetition', (req, res) => {

    if(!req.body.id){
        res.status(400).send('No content');
    }
    db.Competition.findByIdAndRemove(req.body.id, (err) => {
        if(err)
            res.status(400).json(err);
        else
            res.status(200).json({ message: 'usunięto!' });
    });
});



module.exports = router;
