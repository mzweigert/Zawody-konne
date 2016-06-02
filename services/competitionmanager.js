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
router.get('/:id/startList/groups', (req,res) =>{

    if(!req.params.id){
        return res.status(404);
    }
    db.Competition.findById(req.params.id, (err, found) => {

        if(err)
            return res.status(400).json(err);
        if(!found)
            return res.status(404);
        if(found.startList.referringHorses.length < 3)
            return res.status(404).send('Dodaj listę startową aby zarządzać grupami');

        res.render('admin/groups', { 
            id: found._id,
            groupsCount: Math.floor(found.startList.referringHorses.length/3)
        });
    });

});
router.post('/competition/addGroups', (req, res) => {
    let groups = req.body;

    groups.forEach((elem) => {

        if(!elem.name || 
           !elem.gender ||
           elem.horses.length === 0 ||
           elem.arbiters.length === 0){

            return res.status(400).send("Uzupełnij pola!");
        }
    });

    /* group.name
       group.gender === undefined ||
      {

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

/*groups: [{
            name: { type: String, required: true },
            gender: { type: String, required: true },
            horses: [{type: mongoose.Schema.Types.ObjectId, ref: 'Horse'}],
            arbiters: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
            results: [{type: mongoose.Schema.Types.ObjectId, ref: 'Result'}]

        }]*/

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

router.post('/addOrUpdateCompetitionReferringHorses', (req, res) => {

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
            found.save((err) => {
                if(err)
                    res.status(400).json(err);
                else
                    res.status(200).json({ horsesAdded: horsesToAdd, horsesNotAdded: horsesNotAdded });
            }); 
        }


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
