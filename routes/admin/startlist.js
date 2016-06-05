/*jshint node: true, esnext: true*/
'use strict';
var express = require("express"),
    db = require('../../db/database.js'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    router = express.Router();

router.get('/:id/startList', (req,res) =>{

    console.log(req.params.id);
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

router.get('/:id/getAvailableHorses', (req, res) => {

    if(!req.params.id){
        return res.status(400).send("Brak Id!");
    }

    db.Competition.findById(req.params.id)
        .populate('startList.referringHorses.horse')
        .exec((err, found) => {

        db.Horse.find({}, (err, horses) => {
            if(err)
                res.status(400).json(err);
            else{

                let arr =_.filter(horses, function(obj){ 
                    return _.every(found.startList.referringHorses, (obj2) =>{
                        return obj._id.toString() !== obj2.horse._id.toString();
                    });
                }); 

                res.status(200).json(arr);
            }
        });
    });

});
router.get('/:id/getReferringHorses', (req, res) => {

    if(!req.params.id){
        return res.status(400).send("Brak Id!");
    }

    db.Competition.findById(req.params.id)
        .populate('startList.referringHorses.horse')
        .exec((err, found) => {

        let arr = _.groupBy(found.startList.referringHorses, (elem) => {
            return elem.horse.gender;
        });
        if(err)
            res.status(400).json(err);
        else
            res.status(200).json(arr);
    });

});

module.exports = router;