/*jshint node: true, esnext: true*/
'use strict';
var express = require("express"),
    db = require('../db/database.js'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    async = require('async'),
        router = express.Router();



router.get('/:id/startList', (req,res) =>{

    if(!req.params.id){
        return res.status(404);
    }
    db.Competition.findById(req.params.id, (err, found) => {

        if(err)
            return res.status(400).json(err);
        if(!found)
            return res.status(404);

        res.render('admin/startlist', { 
            id: found._id, 
            length: found.startList.referringHorses.length
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
/*
router.get('/getAvailableHorses/:id', (req, res) => {
    if(!req.params.id){
        return res.status(400).send("Brak Id!");
    }

    async.waterfall([
        (callback) => {
            db.Competition.findById(req.params.id, 'startList', (err, found) => {
                if(err)
                    callback(err);
                else
                    callback(null, found);
            });

        }, (found, callback) => {
            let horsesRef = [],
                horsesAll = [];
            console.log(found);
            db.Horse.find({}, (err, all) => {
                found.startList.referringHorses.forEach((elem) => {
                    horsesRef.push(elem.horse.toString());
                });
                all.forEach((elem) => {
                    horsesAll.push(elem._id.toString()); 
                });

                callback(null, _.difference(horsesAll, horsesRef));
            });
        }

    ], (callback, diff) => {
        res.status(200).json(diff);
    });


});*/
router.get('/getCompetitionReferringHorses/:id', (req, res) => {

    if(!req.params.id){
        return res.status(400).send("Brak Id!");
    }

    db.Competition.findById(req.params.id, 'startList', (err, found) => {

        if(err)
            res.status(400).json(err);
        else
            res.status(200).json(found.startList.referringHorses);
    });

});

router.post('/addCompetitionReferringHorses', (req, res) => {

    let referringHorses = req.body.referringHorses;

    if(!referringHorses || !req.body.id){
        return res.status(400).send("Dodaj liste startową!");
    }
    if(referringHorses.length < 3){
        return res.status(400).send("Dodaj minimum 3 konie do listy!");
    }


    db.Competition.findById(req.body.id, (err, found) => {

        let uniqueList = _.uniq(referringHorses, (item, key, horse) => { 
            return item.horse;
        });

        uniqueList.forEach((elem, i) => {
            elem.startNumber = i+1; 
        });

        found.startList.referringHorses = uniqueList;
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

module.exports = router;
