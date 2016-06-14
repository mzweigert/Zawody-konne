/*jshint node: true, esnext: true*/
'use strict';
var express = require("express"),
    io = require('../server.js').io,
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
       !meta.startHour ||
       !meta.arbitersCount ||
       !meta.ratesType){
        return res.status(400).send("Uzupełnij pola!");
    }
    if(meta.arbitersCount < 5 || meta.arbitersCount > 9 ){
        return res.status(400).send("Liczba sędziów powinna wynosić minimum 5!");
    }

    async.waterfall([
        (callback) => {
            db.Competition.find({
                'meta.startDate': meta.startDate
            }, 'startList', (err, comps) => {

                let arbComps = [];
                comps.forEach((comp) => {
                    comp.startList.groups.forEach((group) => {
                        arbComps = arbComps.concat(group.arbiters); 
                    });
                });
                arbComps = _.uniq(arbComps, (item, key, horse) => { 
                    return item;
                });
                callback(null, arbComps);
          
            });

        },
        (arbComps, callback) => {

            db.User.find({'role' : 'arbiter'}, (err, arbiters) => {

                let availArb = _.filter(arbiters, (arb) => {
                    return !_.find(arbComps, (arbComp) =>{
                        return arb._id.toString() === arbComp.toString();
                    });
                });

                if(availArb.length < meta.arbitersCount){
                    return res.status(400).send("Ilość dostępnych sedziów równa " + availArb.length + ' w tym dniu jest za mała aby stworzyć grupy. Liczba sędziów musi wynosić ' + meta.arbitersCount + '. Zmień dzień.');
                }
                else{
                    callback(null);
                }

            });
        }, 
        (callback) => {
            let competition = new db.Competition({
                meta: meta
            });

            competition.save((err) => {
                if(err)
                    res.status(400).json(err);
                else
                    res.status(200).json(competition);  
            });
        }]);

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
    if(meta.arbitersCount < 5 || meta.arbitersCount > 9 ){
        return res.status(400).send("Liczba sędziów musi wynosić od 5 do 9!");
    }

    async.waterfall([
        (callback) => {
            db.Competition.findById(meta.id)
                .populate('startList.groups.arbiters')
                .exec((err, found) => {

                if(err)
                    return res.status(400).json(err);

                if(found.meta.started)
                    return res.status(400).send('Nie można edytowac zawodów, które już się rozpoczeły.');

                callback(null, found);

            });
        },
        (comp, callback) => {
            db.Competition.find({
                'meta.startDate': meta.startDate
            }, 'startList', (err, comps) => {

                let arbComps = [];
                comps.forEach((comp) => {
                    comp.startList.groups.forEach((group) => {
                        arbComps = arbComps.concat(group.arbiters); 
                    });
                });
                arbComps = _.uniq(arbComps, (item, key, horse) => { 
                    return item;
                });

                callback(null, comp, arbComps);

            });

        },
        (comp, arbComps, callback) => {

            db.User.find({'role' : 'arbiter'}, (err, arbiters) => {

                let availArbDay = _.filter(arbiters, (arb) => {
                    return !_.find(arbComps, (arbComp) =>{
                        return arb._id.toString() === arbComp.toString();
                    });
                });

                let arbInGroups = [];

                comp.startList.groups.forEach((group) => {
                    arbInGroups = arbInGroups.concat(group.arbiters);
                });
                arbInGroups = _.uniq(arbInGroups, (item, key, horse) => { 
                    return item;
                });

                availArbDay = availArbDay.concat(arbInGroups);

                if(availArbDay.length < meta.arbitersCount){
                    return res.status(400).send("Ilość dostępnych sedziów równa " + availArbDay.length + ' w tym dniu jest za mała aby stworzyć grupy. Liczba sędziów musi wynosić ' +meta.arbitersCount + '. Zmień dzień.');
                }
                else{

                    comp.meta = meta;
                    comp.startList.groups = [];
                    comp.save((err) => {
                        if(err)
                            res.status(400).json(err);
                        else
                            res.status(200).json(comp);  
                    });

                }

            });
        }, 
    ]);

});

router.post('/updateCurrentHorse', (req, res) => {

    if(!req.body.idComp || !req.body.idHorse){
        return res.status(400).send("Brak Id!");
    }

    async.waterfall([
        function(callback) {
            db.Competition.findById(
                req.body.idComp, 
                'startList.currentVoteHorse', 
                (err, found) => {

                    if(err)
                        return res.status(400).json(err);
                    if(!found)
                        return res.status(404);
                    callback(null, found);

                });
        },
        function(comp, callback) {

            db.Horse.findById(req.body.idHorse, (err, found) => {
                if(err)
                    return res.status(400).json(err);
                if(!found)
                    return res.status(404);

                if(!comp.meta.started)
                    comp.meta.started = true;

                callback(null, comp);
            });

        }
    ], function (err, result) {

        result.save((err) => {

            if(err)
                res.status(400).json(err);
            else
                res.status(200).json(result);  
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

