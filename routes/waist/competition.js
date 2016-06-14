/*jshint node: true, esnext: true */
'use strict';
var express = require('express'),
    passport = require('../../config/passportconfig.js'),
    db = require('../../db/database.js'),
    _ = require('underscore'),
    router = express.Router();

router.get('/getCompGroups/:id',  (req, res) => {
    if(req.params.id === undefined){
        res.status(404).send('No content');
    }
    db.Competition.findById(req.params.id)
        .populate('startList.groups.horses')
        .exec((err, found) => {

        if(err)
            return res.status(404).json(err);

        res.status(200).json({
            currentVoteHorse: found.startList.currentVoteHorse,
            groups: found.startList.groups

        });

    });
});

router.get('/group/:id', (req, res) => {
    if(req.params.id === undefined){
        res.status(404).send('No content');
    }

    db.Competition.findOne({ 'startList.groups._id': req.params.id })
        .populate('startList.referringHorses.horse')
        .populate('startList.groups.arbiters')
        .exec((err, found) => {

        if(err)
            return res.status(404).json(err);

        if(!found){
            return res.status(404).send('Nie znaleziono grupy!');
        }
        let group = _.find(found.startList.groups, (group) => {
            return group._id.toString() === req.params.id; 
        }).toObject();

        db.Result.find({'compId': found._id}, (err, results) => {

            let allResults = _.filter(results, (result) => {
                return _.find(group.horses, (horse) => {
                    return horse.toString() === result.horseId.toString(); 
                });
            });
            let fullResults = _.filter(allResults, (result) => {
                return result.type && result.head && result.neck &&
                    result.legs && result.body && result.movement;
            });
            fullResults = _.groupBy(fullResults, function(res){ return res.horseId.toString(); });
            let arr = [];
            for(let key in fullResults){
                if(fullResults[key].length === found.meta.arbitersCount){
                    let sum = 0;
                    for(let i=0; i<fullResults[key].length; i++) {
                        sum += (fullResults[key][i].type + fullResults[key][i].head + fullResults[key][i].neck +
                                fullResults[key][i].legs + fullResults[key][i].body + fullResults[key][i].movement);
                    }

                    sum /= found.meta.arbitersCount;
                    arr.push({horse: fullResults[key][0].horseId, average: sum});
                }
            }

            arr.forEach((elem) => {
                elem.horse = _.find(found.startList.referringHorses, (SLHorse) => {
                    return SLHorse.horse._id.toString() === elem.horse.toString();
                });
            });
            arr = _.sortBy(arr, (elem) => -elem.average);

            res.render('waist/group',{
                arbiters: group.arbiters,
                compId: found._id,
                groupId: group._id,
                fullResults: arr
            });
        });

    });
});

router.get('/getGroupResults/:id', (req, res) => {
    if(req.params.id === undefined){
        res.status(404).send('No content');
    }

    db.Competition.findOne({ 'startList.groups._id': req.params.id })
        .populate('startList.referringHorses.horse')
        .populate('startList.groups.arbiters')
        .exec((err, found) => {

        if(err)
            return res.status(404).json(err);

        if(!found){
            return res.status(404).send('Nie znaleziono grupy!');
        }
        let group = _.find(found.startList.groups, (group) => {
            return group._id.toString() === req.params.id; 
        }).toObject();

        db.Result.find({'compId': found._id}, (err, results) => {

            let allResults = _.filter(results, (result) => {
                return _.find(group.horses, (horse) => {
                    return horse.toString() === result.horseId.toString(); 
                });
            });
            let fullResults = _.filter(allResults, (result) => {
                return result.type && result.head && result.neck &&
                    result.legs && result.body && result.movement;
            });
            fullResults = _.groupBy(fullResults, function(res){ return res.horseId.toString(); });
            let arr = [];
            for(let key in fullResults){
                if(fullResults[key].length === found.meta.arbitersCount){
                    let sum = 0;
                    for(let i=0; i<fullResults[key].length; i++) {
                        sum += (fullResults[key][i].type + fullResults[key][i].head + fullResults[key][i].neck +
                                fullResults[key][i].legs + fullResults[key][i].body + fullResults[key][i].movement);
                    }

                    sum /= found.meta.arbitersCount;
                    arr.push({horse: fullResults[key][0].horseId, average: sum});
                }
            }

            arr.forEach((elem) => {
                elem.horse = _.find(found.startList.referringHorses, (SLHorse) => {
                    return SLHorse.horse._id.toString() === elem.horse.toString();
                });
            });

            arr = _.sortBy(arr, (elem) => -elem.average);

            return res.status(200).json(arr);
        });
    });
});
router.get('/getCurrentHorseResults/:id', (req, res) => {

    if(!req.params.id){
        return res.status(400).send("Brak Id!");
    }

    db.Competition.findOne( {'startList.groups._id' : req.params.id})
        .populate('startList.currentVoteHorse')
        .populate('startList.referringHorses.horse')
        .exec((err, found) => {
        if(err)
            return res.status(400).json(err);
        if(!found)
            return res.status(404).send('');
        if(!found.startList.currentVoteHorse){
            return res.status(404).send('');
        }


        let group = _.find(found.startList.groups, (group) => {
            return group._id.toString() === req.params.id;
        });

        let check = _.find(group.horses, (horse) => {
            return horse.toString() === found.startList.currentVoteHorse._id.toString(); 
        });
        if(!check)
            return res.status(404).send('');

        let currWSN = _.find(found.startList.referringHorses, (SLHorse) => {
            return SLHorse.horse._id.toString() === found.startList.currentVoteHorse._id.toString();
        });

        db.Result.find({ 
            compId: found._id,
            horseId: found.startList.currentVoteHorse 
        }).populate('arbiterId').exec((err, results) => {

            if(err)
                return res.status(400).json(err);
            if(!results)
                return res.status(404);

            return res.status(200).json({ horse: currWSN, results :results});
        });
    });
});

module.exports = router;