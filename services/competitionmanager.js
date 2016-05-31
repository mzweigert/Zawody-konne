/*jshint node: true, esnext: true*/
'use strict';
var express = require("express"),
    db = require('../db/database.js'),
    mongoose = require('mongoose'),
    router = express.Router();

router.get('/:id/startList', (req,res) =>{

    if(!req.params.id){
        console.log("DUPA");
        return res.status(404);
    }
    db.Competition.findById(req.params.id, (err, found) => {
        
        console.log(err, found);
        if(err)
            return res.status(400).json(err);
        if(!found)
            return res.status(404);

        res.render('admin/startlist', { 
            id: found._id, 
            startList: found.startList 
        });
    });


});
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

    let competition = new db.Competition({
        meta: meta
    });

    competition.save((err) => {
        console.log(err);
        if(err)
            res.status(400).json(err);
        else
            res.status(200).json(competition);  
    });


    /* group.name
       group.gender === undefined ||
       group.horses.length === 0 ||
       group.arbiters.length === 0){

        res.sendStatus(400);
    }*/

});
router.post('/addStartListCompetition', (req, res) => {

    let startList = req.body.startList;

    if(!startList || !req.body.id){
        return res.status(400).send("Dodaj liste startową!");
    }

    if(startList.referringHorses.length < 3){
        return res.status(400).send("Dodaj minimum 3 konie do listy!");
    }

    db.Competition.findById(req.body.id, (err, found) => {

        found.startList = startList;
        found.save((err) => {

            if(err)
                res.status(400).json(err);
            else
                res.status(200).json(found); 
        });

    });  


    /* group.name
       group.gender === undefined ||
       group.horses.length === 0 ||
       group.arbiters.length === 0){

        res.sendStatus(400);

    groups: [{
        name: { type: String, required: true },
        gender: { type: String, required: true },
        horses: [{horse:{type: mongoose.Schema.Types.ObjectId, ref: 'Horse'}, startNumber: Number}],
        arbiters: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
        results: [{type: mongoose.Schema.Types.ObjectId, ref: 'Result'}]

    }]
    }*/

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

    db.Competition.findById(req.params.id, (err, found) => {

        if(err)
            res.status(400).json(err);
        else
            res.status(200).json(found);  
    });
});/*
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
});*/

module.exports = router;
