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

/*
io.on('connection', function (socket) {

    let user = socket.request.user;

    if(user.role === 'admin'){
        socket.on('updCurrHor', function (data) {
            async.waterfall([
                function(callback) {
                    db.Competition.findById(
                        data.idComp, 
                        'startList',
                        (err, found) => {

                            if(!found){
                                socket.emit('err', { err: 'Nie znaleziono zawodów!', status: 404});
                                return;
                            }
                            callback(null, found);

                        });
                },
                function(comp, callback) {

                    db.Horse.findById(data.idHorse, (err, found) => {
                        if(err){
                            socket.emit('err', { err: err, status: 400});
                            return;
                        }
                        if(!found){
                            socket.emit('err', { err: 'Nie znaleziono konia!', status: 404});
                            return;
                        }
                        if(!comp.meta.started)
                            comp.meta.started = true;

                        comp.startList.currentVoteHorse = found;
                        callback(null, comp);


                    });
                },function(comp, callback) {
                    comp.save((err, saved) => {
                        if(err){
                            socket.emit('err', { err: err, status: 400});
                            return;
                        }
                        if(!saved){
                            socket.emit('err', { err: 'Nie znaleziono konia!', status: 404});
                            return;
                        }
                        socket.broadcast.emit('startVote', true);
                    });

                }]);
        });

    } else {
        socket.on('startVote', () => {
            db.Competition.findOne({
                'meta.started': true,
                'startList.groups.arbiters': user._id })
                .populate('startList.referringHorses.horse')
                .exec((err, found) => {
                if(err){
                    socket.emit('err', { err: err, status: 400});
                    return;
                }
                if(!found){
                    socket.emit('err', { err: 'Nie znaleziono konia!', status: 404});
                    return;
                }

                let o = _.filter(found.startList.groups, function(group){
                    return _.find(group.arbiters, (arb) => {
                        return arb.toString() === user._id.toString();
                    });
                });
                o = _.find(o, (group) => {
                    return _.find(group.horses, (horse) => {
                        return horse.toString() === found.startList.currentVoteHorse.toString();
                    });
                });
                if(!o){
                    socket.emit('currentHorse', { err: 'Nie oceniasz teraz żadnego konia.', status: 404});
                    return;
                }

                o = _.find(found.startList.referringHorses, (elem) => {

                    return elem.horse._id.toString() === found.startList.currentVoteHorse.toString();
                });

                socket.emit('currentHorse', o);
            });
        });

    }
});*/
module.exports = router;

