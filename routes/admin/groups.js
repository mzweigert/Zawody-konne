/*jshint node: true, esnext: true*/
'use strict';
var express = require("express"),
    db = require('../../db/database.js'),
    mongoose = require('mongoose'),
    async = require('async'),
        _ = require('underscore'),
        router = express.Router();

router.get('/:id/addGroups', (req,res) =>{

    if(!req.params.id ){
        return res.status(404);
    }
    let spliteByGroups = (array, arrGroups) => {

        if(!arrGroups){
            arrGroups = [];
        }
        if(!array){
            return arrGroups;
        }
        if(!array.length){
            return arrGroups;
        }
        let k = array.length;

        if(k % 5 === 0){
            arrGroups.unshift(array.splice(k - 5, 5));
            return spliteByGroups(array, arrGroups);
        }else if(k % 4 === 0){
            arrGroups.unshift(array.splice(k - 4, 4));
            return spliteByGroups(array, arrGroups);
        }else if(k % 3 === 0){
            arrGroups.unshift(array.splice(k -3, 3));
            return spliteByGroups(array, arrGroups);
        }
        else if(k % 3 === 1){
            arrGroups.unshift(array.splice(k - 4, 4));
            return spliteByGroups(array, arrGroups);
        }
        else{
            arrGroups.unshift(array.splice(k - 3, 3));
            return spliteByGroups(array, arrGroups);
        }
    };
    async.waterfall([
        (callback) => {

            db.Competition.findById(req.params.id)
                .populate('startList.referringHorses.horse')
                .exec((err, found) => {

                if(err)
                    return res.status(400).json(err);
                if(!found)
                    return res.status(404);
                if(found.startList.referringHorses.length < 3)
                    return res.status(404).send('Dodaj listę startową aby zarządzać grupami');
                if(found.meta.started)
                    return res.redirect('./results');


                let groupsH = [],
                    reffH = []; 
                if(found.startList.groups.length){
                    found.startList.groups.forEach((elem) => {
                        groupsH = groupsH.concat(elem.horses);
                    });

                    reffH = _.filter(found.startList.referringHorses, (refH) => {
                        return _.every(groupsH, (horse) => {
                            return horse.toString() !== refH.horse._id.toString();  
                        });
                    });  
                }
                else{
                    reffH = found.startList.referringHorses;
                }

                if(!reffH.length)
                    return res.redirect('./editGroups');


                let maresGroups,
                    stallionsGroups,
                    genderHN = _.groupBy(reffH, (elem) => {
                        return elem.horse.gender === 'Ogier' ? 'Ogier' : 'Klacz';
                    });

                genderHN.Klacz = spliteByGroups(genderHN.Klacz);
                genderHN.Ogier = spliteByGroups(genderHN.Ogier);
                callback(null, found, genderHN);
            });
        },
        (comp, genderHN, callback) => {
            db.Competition.find({
                'meta.startDate': comp.meta.startDate
            }, 'startList', (err, comps) => {

                let arbComps = [];
                comps.forEach((competition) => {
                    //Nie bierz pod uwagę zawodów pod ktorymi zostalo wywolane addGroups
                    if(competition._id.toString() !== comp._id.toString()){
                        competition.startList.groups.forEach((group) => {
                            arbComps = arbComps.concat(group.arbiters); 
                        });
                    }
                });

                callback(null, comp, genderHN, arbComps);

            });

        },
        (comp, genderHN, arbComps, callback) => {
            db.User.find({'role' : 'arbiter'}, (err, arbiters) => {

                let availArbInDay = _.filter(arbiters, (arb) => {
                    return !_.find(arbComps, (arbComp) =>{
                        return arb._id.toString() === arbComp.toString();
                    });
                });

                if(availArbInDay.length < comp.meta.arbitersCount){
                    return res.status(400).send("Ilość dostępnych sedziów równa " + availArbInDay.length + ' w tym dniu jest za mała aby stworzyć grupy. Liczba sędziów musi wynosić ' + comp.meta.arbitersCount + '. Zmień dzień.');
                }
                else{
                    res.render('admin/addGroups', { 
                        id: comp._id,
                        maresGroups:   genderHN.Klacz,
                        stallionsGroups: genderHN.Ogier,
                        arbiters: availArbInDay
                    });
                }

            });
        }
    ]);


});

router.get('/:id/editGroups', (req,res) =>{

    if(!req.params.id ){
        return res.status(404);
    }
    async.waterfall([
        (callback) => {
            db.Competition.findById(req.params.id)
                .populate('startList.referringHorses.horse')
                .populate('startList.groups.arbiters')
                .populate('startList.groups.horses')
                .exec((err, found) => {

                if(err)
                    return res.status(400).json(err);
                if(!found)
                    return res.status(404);
                if(found.startList.referringHorses.length < 3)
                    return res.status(404).send('Dodaj listę startową aby zarządzać grupami');
                if(found.meta.started)
                    return res.redirect('./results');

                callback(null, found);
            });
        },
        (comp, callback) => {
            db.Competition.find({
                'meta.startDate': comp.meta.startDate
            }, 'startList', (err, comps) => {

                let arbComps = [];
                comps.forEach((competition) => {
                    //Nie bierz pod uwagę zawodów pod ktorymi zostalo wywolane addGroups
                    if(competition._id.toString() !== comp._id.toString()){
                        competition.startList.groups.forEach((group) => {
                            arbComps = arbComps.concat(group.arbiters); 
                        });
                    }
                });

                callback(null, comp, arbComps);

            });

        },
        (comp, arbComps, callback) => {

            db.User.find({role: 'arbiter'}, (err, arbiters) => {

                let availArbInDay = _.filter(arbiters, (arb) => {
                    return !_.find(arbComps, (arbComp) =>{
                        return arb._id.toString() === arbComp.toString();
                    });
                });


                let groups;
                let availableArbiters = [],
                    horsesWithSN = [];


                groups = comp.startList.groups.map((elem) => {
                    let obj = elem.toObject();

                    availableArbiters = _.filter(availArbInDay, (arbiter) => {
                        return _.every(elem.arbiters, (arbGr) => {
                            return arbGr._id.toString() !== arbiter._id.toString();
                        });
                    });
                    horsesWithSN = _.filter(comp.startList.referringHorses, (SLHorse) => {
                        return _.find(elem.horses, (horse) => {
                            return horse._id.toString() === SLHorse.horse._id.toString();
                        });
                    });
                    obj.horses = horsesWithSN;
                    obj.availableArbiters = availableArbiters;
                    return obj;

                });

                let  genderHN = _.groupBy(groups, (elem) => {
                    return elem.gender === 'Ogier' ? 'Ogier' : 'Klacz';
                });

                res.render('admin/editGroups', { 
                    id: comp._id,
                    maresGroups:   genderHN.Klacz? genderHN.Klacz: [],
                    stallionsGroups: genderHN.Ogier? genderHN.Ogier: [] 
                });
            });

        }
    ]);


});

router.post('/addGroup', (req, res) => {

    let group = req.body.group,
        check;


    if(!req.body.id || !group){
        return res.status(404);
    }
    if(group.name.length < 5){
        return res.status(400).json({message:'Nazwa grupy musi miec minimum 5 i maksimum 10 znakow!', fail: group, typeErr: 'name'});
    }
    check = _.uniq(group.horses, (elem) => {
        return elem; 
    });
    if(check.length < 3 || check.length > 5 ){
        return res.status(400).json({message:'Grupa musi mieć minimum 3 i maksimum 5 koni!', fail: group, typeErr: 'horses'});
    }


    db.Competition.findById(req.body.id, (err, found) => { 
        if(err)
            return res.status(400).json(err);

        check = _.uniq(group.arbiters, (elem) => {
            return elem; 
        });
        if(group.arbiters.length !== found.meta.arbitersCount){
            return res.status(400).json({message:'Grupa musi mieć ' + found.meta.arbitersCount + ' sędziów!', fail: group, typeErr: 'arbiters'});
        }

        delete group.id;
        let arrTmp = [];
        found.startList.groups.forEach((elem) => {
            arrTmp = arrTmp.concat(elem.horses);
        });
        arrTmp = _.filter(group.horses, (elem) => {
            return _.every(arrTmp, (arrH) => {
                return elem.toString() !== arrH.toString(); 
            });
        });

        if(!arrTmp.length)
            return res.status(400).json({message:'Grupa zawierająca te konie, została już dodana!', fail: group, typeErr: 'horses'});

        found.startList.groups.push(group);

        found.save((err) => {
            if(err)
                res.status(400).json(err);
            else
                res.status(200).json(found); 
        });
    });


});

router.post('/editGroup', (req, res) => {

    let group = req.body.group,
        check;


    if(!req.body.id || !group){
        return res.status(404);
    }
    if(!group.id){
        return res.status(400).json({message:'Grupa nie posiada id!', fail: group, typeErr: 'id'});
    }
    if(group.name.length < 5){
        return res.status(400).json({message:'Nazwa grupy musi miec minimum 5 i maksimum 10 znakow!', fail: group, typeErr: 'name'});
    }
    check = _.uniq(group.horses, (elem) => {
        return elem; 
    });
    if(check.length < 3 || check.length > 5 ){
        return res.status(400).json({message:'Grupa musi mieć minimum 3 i maksimum 5 koni!', fail: group, typeErr: 'horses'});
    }


    db.Competition.findById(req.body.id, (err, found) => { 
        if(err)
            return res.status(400).json(err);
        
        check = _.uniq(group.arbiters, (elem) => {
            return elem; 
        });
        if(group.arbiters.length !== found.meta.arbitersCount){
            return res.status(400).json({message:'Grupa musi mieć ' + found.meta.arbitersCount + ' sędziów!', fail: group, typeErr: 'arbiters'});
        }

        db.Competition.update({'startList.groups._id': group.id}, {'$set': {
            'startList.groups.$.name': group.name,
            'startList.groups.$.gender': group.gender,
            'startList.groups.$.arbiters': group.arbiters,
            'startList.groups.$.results': group.results

        }}, function(err, done) { 
            if(err)
                res.status(400).json(err);
            else
                res.status(200).json(done); 
        });

    });


});

module.exports = router;