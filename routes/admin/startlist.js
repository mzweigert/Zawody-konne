/*jshint node: true, esnext: true*/
'use strict';
var express = require("express"),
    db = require('../../db/database.js'),
    mongoose = require('mongoose'),
    async = require('async'),
        _ = require('underscore'),
        router = express.Router();

router.get('/:id/startList', (req,res) =>{


    if(!req.params.id){
        return res.status(404);
    }

    async.waterfall([
        (callback) => {

            db.Competition.findById(req.params.id)
                .populate('startList.referringHorses.horse')
                .exec((err, found) => {

                if(err)
                    return res.status(400).json(err);
                if(!found)
                    return res.status(404);
                if(found.meta.started)
                    return res.redirect('./results');

                callback(null, found);

            });
        },
        (comp, callback) => {

            db.Competition.find({
                'meta.startDate': comp.meta.startDate
            }, 'startList', (err, comps) => {

                let horseComps = [];
                comps.forEach((comp) => {
                      horseComps = horseComps.concat(comp.startList.referringHorses); 
                });
            
                callback(null, comp, horseComps);

            });

        },
        (comp, horseComps, callback) => {

            db.Horse.find({}, (err, horses) => {
                if(err)
                    return res.status(400).json(err);

                let availHorsesInDay = _.filter(horses, (hor) => {
                    return !_.find(horseComps, (horComp) =>{
                        return hor._id.toString() === horComp.horse.toString();
                    });
                });
        
                if((availHorsesInDay.length + comp.startList.referringHorses.length) < 3){
                    return res.status(400).send("Ilość dostępnych koni równa " + availHorsesInDay.length + ' jest za mała aby stworzyć listę startową, gdzie potrzeba minimum 3 konie. Zmień dzień');
                }
                let refHLength =  comp.startList.referringHorses.length,
                    availHorses =_.filter(availHorsesInDay, function(obj){ 
                        return _.every(comp.startList.referringHorses, (obj2) =>{
                            return obj._id.toString() !== obj2.horse._id.toString();
                        });
                    }); 

                let lengthGrH = 0;

                comp.startList.groups.forEach((elem) => {
                    lengthGrH += elem.horses.length;
                });

                let editGroups;

                if(refHLength.length)
                    editGroups = lengthGrH === refHLength? true : false;
                else
                    editGroups = false;

                res.render('admin/startlist', { 
                    id: comp._id, 
                    referringHorses: comp.startList.referringHorses,
                    availableHorses: availHorses,
                    editGroups: editGroups
                });


            });

        }
    ]);



});

router.post('/addOrUpdateReferringHorses', (req, res) => {

    let referringHorses = req.body.referringHorses;

    if(!referringHorses || !req.body.id){
        return res.status(400).send("Dodaj liste startową!");
    }

    db.Competition.findById(req.body.id, (err, found) => {
        let horsesNotAdded = [],
            genderCount,
            horsesToAdd = _.uniq(referringHorses, (item, key, horse) => { 
                //Funkcja usuwająca duplikaty w razie jakby ktoś kombinował
                return item.horse;
            });


        genderCount = _.countBy(horsesToAdd, (elem) => {
            //Funkcja wyliczająca ilosc ogierow i klaczy
            return elem.gender === 'Ogier' ? 'Ogier' : 'Klacz';
        });

        if(genderCount.Ogier < 3){
            horsesNotAdded = horsesNotAdded.concat(_.filter(horsesToAdd, (elem) => {
                return elem.gender === 'Ogier'; 
            }));

            horsesToAdd = _.filter(horsesToAdd, (elem) => {
                return elem.gender !== 'Ogier'; 
            });
        }
        if(genderCount.Klacz < 3){
            horsesNotAdded = horsesNotAdded.concat(_.filter(horsesToAdd, (elem) => {
                return elem.gender === 'Klacz'; 
            }));
            horsesToAdd = _.filter(horsesToAdd, (elem) => {
                return elem.gender !== 'Klacz'; 
            });
        }

        if(horsesToAdd.length < 3){
            return res.status(400).send('Proszę dodać minimum 3 konie tej samej płci');
        }
        else{
            horsesToAdd = _.map(horsesToAdd, (o) => _.omit(o, 'gender'));

            horsesToAdd.forEach((elem, i) => {
                //Funkcja nadająca nowe numery startowe w razie gdyby ktoś dodał zduplikowanego konia
                elem.startNumber = i+1; 
            });

            found.startList.referringHorses = horsesToAdd;
            found.startList.currentVoteHorse = undefined;
            found.startList.groups = [];
            found.save((err) => {
                if(err)
                    res.status(400).json(err);
                else
                    res.status(200).json({ horsesAdded: horsesToAdd, horsesNotAdded: horsesNotAdded });
            }); 
        }


    });  

});

module.exports = router;