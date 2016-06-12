/*jshint node: true, esnext: true*/
'use strict';
var express = require("express"),
    io = require('../../server.js').io,
    db = require('../../db/database.js'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    async = require('async'),
        router = express.Router();

router.get('/:id/results', (req,res) =>{

    if(!req.params.id ){
        return res.status(404);
    }
    db.Competition.findById(req.params.id)
        .populate('startList.groups.horses')
        .populate('startList.groups.arbiters')
        .exec((err, found) => {

        if(err)
            return res.status(400).json(err);
        if(!found)
            return res.status(404);

        let  lenHorGr = 0;
        found.startList.groups.forEach((gr) => {
            lenHorGr += gr.horses.length;
        });

        if(!found.startList.referringHorses.length)
            return res.redirect('./startList');
        if(lenHorGr !== found.startList.referringHorses.length)
            return res.redirect('./addGroups');

        res.render('admin/results', {
            compId: found._id,
            groups: found.startList.groups,
            currentHorse: found.startList.currentVoteHorse,
        });  



    });

});

router.get('/:id/getCompResults' , (req, res) => { 

    if(!req.params.id){
        return res.status(400).send("Brak Id!");
    }

    db.Result.find({ compId : req.params.id })
        .populate('arbiterId')
        .exec((err, results) => {
        if(err)
            return res.status(400).json(err);
        if(!results)
            return res.status(404);

        return res.status(200).json(results);

    });
});

router.get('/:id/getCurrentHorse', (req, res) => {

    if(!req.params.id){
        return res.status(400).send("Brak Id!");
    }


    db.Competition.findById(
        req.params.id, 
        'startList.currentVoteHorse', 
        (err, found) => {

            if(err)
                return res.status(400).json(err);
            if(!found)
                return res.status(404);
            if(!found.startList.currentVoteHorse)
                return res.status(404);

            return res.status(200).json(found.startList.currentVoteHorse);
        });
});

router.get('/:id/getCurrentHorseResults', (req, res) => {

    if(!req.params.id){
        return res.status(400).send("Brak Id!");
    }

    db.Competition.findById(
        req.params.id, 
        'startList.currentVoteHorse', 
        (err, found) => {
            if(err)
                return res.status(400).json(err);
            if(!found)
                return res.status(404);
            if(!found.startList.currentVoteHorse)
                return res.status(404);

            db.Result.find({ 
                horseId: found.startList.currentVoteHorse 
            }, (err, results) => {

                if(err)
                    return res.status(400).json(err);
                if(!results)
                    return res.status(404);

                return res.status(200).json(results);
            });
        });
});

io.on('connection', (socket) => { 
    let user = socket.request.user;

    if(user.role === 'admin'){
        socket.on('setCurrHorse', (data) => {

            async.waterfall([
                (callback) => {
                    db.Competition.findById(
                        data.compId, 
                        'startList meta',
                        (err, found) => {
                            if(err){
                                socket.emit('err', { err: err, status: 400});
                                return;
                            }
                            if(!found){
                                socket.emit('err', { err: 'Nie znaleziono zawodów!', status: 404});
                                return;
                            }
                            if(found.startList.currentVoteHorse){
                                socket.emit('err', { err: 'Nie możesz już zmienić akutalnie ocenianego konia!', status: 400});
                                return;
                            }

                            callback(null, found);
                        });
                },
                (comp, callback) => {
                    db.Horse.findById(data.horseId, (err, found) => {
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
                        socket.emit('setCurrHorse-'+comp._id, found._id );
                        callback(null, comp);

                    });
                },(comp, callback) => {

                    comp.save((err, saved) => {

                        if(err){
                            socket.emit('err', { err: err, status: 400});
                            return;
                        }
                        if(!saved){
                            socket.emit('err', { err: 'Nie znaleziono konia!', status: 404});
                            return;
                        }

                        callback(null, comp);

                    });

                },(comp, callback) => { 
                    let currHor = comp.startList.currentVoteHorse._id.toString(),
                        group,
                        horseWithSN,
                        resArray = [];

                    group = _.find(comp.startList.groups, (group) => {
                        return _.find(group.horses, (horse) => {
                            return horse.toString() === currHor;  
                        });
                    });


                    group.arbiters.forEach((arbiter) => {
                        let result = {
                            compId: comp._id,
                            arbiterId: arbiter,
                            horseId: currHor
                        };
                        resArray.push(result); 
                    });

                    horseWithSN = _.find(comp.startList.referringHorses, (elem) => {
                        return elem.horse.toString() === currHor;  
                    });

                    db.Result.insertMany(resArray, (err, saved) => {
                        if(err){
                            socket.emit('err', { err: 'Nie zapisano wyników startowych!', status: 404});
                            return;
                        }
                        saved.forEach((result) => {

                            let resToObj = result.toObject();
                            resToObj.horseId = horseWithSN;
                            resToObj.ratesType = comp.meta.ratesType;
                            socket.broadcast.emit('canStartVote-'+result.arbiterId, { result: resToObj });
                        });

                    });

                }]);
        });
        socket.on('remind-endEst', (compId) => {

            if(compId === 'undefined'){
                socket.emit('err', { err: 'Nie znaleziono Id!', status: 404});
                return;
            }
            async.waterfall([
                (callback) => {
                    db.Competition.findById(compId, (err, comp) => {

                        if(err || !comp){
                            socket.emit('err', { err: 'Nie znaleziono zawodów!', status: 404});
                            return;
                        }

                        callback(null, comp);
                    });
                },
                (comp, callback) => {
                    db.Result.find({ 
                        compId: comp._id, 
                        horseId: comp.startList.currentVoteHorse 
                    }, (err, results) => {
                        if(err || !comp){
                            socket.emit('err', { err: 'Nie znaleziono wyników!', status: 404});
                            return;
                        }

                        let arbToRemind = _.filter(results, (result) => {
                            return (isNaN(result.overall) || 
                                    isNaN(result.head) || 
                                    isNaN(result.body) || 
                                    isNaN(result.legs) || 
                                    isNaN(result.movement));  
                        });

                        if(arbToRemind.length){
                            arbToRemind.forEach((arb) => {
                                socket.broadcast.emit('remind-'+ arb.arbiterId, arb);
                            });
                        }
                        else{
                            callback(null, comp, results);
                        }
                    });
                },
                (comp, results, callback) => { 

                    comp.startList.currentVoteHorse = undefined;

                    comp.save((err, saved) => {
                        results.forEach((result) => {
                            socket.broadcast.emit('canStartVote-' + result.arbiterId);
                        });
                        socket.emit('setCurrHorse-' + compId);
                    });
                }
            ]);

        });
    }
});

module.exports = router;
