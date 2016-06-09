/*jshint node: true */
/*jshint node: true, esnext: true*/
'use strict';

var express = require('express'),
    io = require('../../server.js').io,
    db = require('../../db/database.js'),
    mongoose = require('mongoose'),
    _ = require('underscore'),
    async = require('async'),
        router = express.Router();


router.get('/', (req, res) => {
    db.Competition.findOne({
        'meta.started': true,
        'startList.groups.arbiters': req.user._id }, 'meta startList')
        .populate('startList.referringHorses.horse')
        .populate('startList.groups.results')
        .exec((err, found) => {

        if(err)
            return res.status(400).json(err);
        if(!found){
            return res.render('arbiter/arbiter', {
                id: req.user._id,
                result: null,
                idComp: null,
                currentHorse : undefined,
                ratesType: null
            });
        }
        if(!found.startList.currentVoteHorse){
            return res.render('arbiter/arbiter', {
                id: req.user._id,
                result: null,
                idComp: found._id,
                currentHorse: undefined, 
                ratesType: found.meta.ratesType
            });
        }
        let o = _.find(found.startList.groups, function(group){
            return (_.find(group.arbiters, (arb) => {
                return arb.toString() === req.user._id.toString();
            }) && _.find(group.horses, (horse) => {
                return horse.toString() === found.startList.currentVoteHorse.toString();
            }));
        });

        if(!o){
            res.render('arbiter/arbiter', {
                id: req.user._id,
                result: null,
                idComp: found._id,
                currentHorse: undefined, 
                ratesType: found.meta.ratesType
            });
            
            
        }
        else{

            let currResult;
            _.find(found.startList.groups, (group) => { 
                currResult = _.find(group.results, (res) => {
                    return (res.arbiterId.toString() === req.user._id.toString() && 
                            _.find(group.horses, (hor) => {
                        return hor.toString() === found.startList.currentVoteHorse.toString();
                    }));
                });
                if(currResult)
                    return true;
            });
 
            o = _.find(found.startList.referringHorses, (elem) => {
                return elem.horse._id.toString() === found.startList.currentVoteHorse.toString();
            });
             console.log(currResult);
            res.render('arbiter/arbiter', {
                id: req.user._id,
                result: currResult,
                idComp: found._id,
                currentHorse : o,
                ratesType: found.meta.ratesType
            });
        }
    });
});
io.sockets.on('connection', (socket) => {

    let user = socket.request.user;

    if(user.role === "arbiter") {

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

                let o = _.find(found.startList.groups, function(group){
                    return (_.find(group.arbiters, (arb) => {
                        return arb.toString() === user._id.toString();
                    }) && _.find(group.horses, (horse) => {
                        return horse.toString() === found.startList.currentVoteHorse.toString();
                    }));
                });

                if(!o){
                    socket.emit('currentHorse', { err: 'Nie oceniasz teraz żadnego konia.', status: 404});
                    return;
                }

                o = _.find(found.startList.referringHorses, (elem) => {
                    return elem.horse._id.toString() === found.startList.currentVoteHorse.toString();
                });

                socket.emit('currentHorse', {
                    id: user._id,
                    idComp: found._id,
                    currentHorse: o, 
                    ratesType: found.meta.ratesType
                });
            });
        });

        socket.on('vote', (result) => {

            db.Competition.findById(result.idComp)
                .populate('startList.groups.results')
                .exec((err, comp) =>{


                if(err){
                    socket.emit('err', { err: err, status: 400});
                    return;
                }
                if(!comp){
                    socket.emit('err', { err: 'Nie znaleziono zawodów!', status: 404});
                    return;
                }

                if(comp.startList.currentVoteHorse.toString() !== result.horseId){
                    socket.emit('err', { err: 'Koń o id = ' + result.horseId + ' nie jest aktualnie ocenianym koniem w zawodach', status: 404});
                    //console.log(found.startList.currentVoteHorse, result.horseId);
                    return;
                }


                if(result.id){
                    delete result.idComp;
                    db.Result.findOneAndUpdate({_id: result.id},
                                               result,
                                               {new:true},
                                               (err, res) => {

                        if(err){
                            socket.emit('err', { err: err, status: 400});
                            return;
                        }
                        socket.broadcast.emit('updateVote', res);
                    });
                }
                else{

                    let group = _.find(comp.startList.groups, function(group){
                        return (_.find(group.arbiters, (arb) => {
                            return arb.toString() === user._id.toString();
                        }) && _.find(group.horses, (horse) => {
                            return horse.toString() === comp.startList.currentVoteHorse.toString();
                        }));
                    });
                    let resultToDB = new db.Result(result);
                    resultToDB.save((err, result) => { 

                        db.Competition.update(
                            {'startList.groups._id': group._id}, 
                            {'$push': { 'startList.groups.$.results': result }},
                            function(err, done) { 
                                if(err){
                                    socket.emit('err', { err: err, status: 400});
                                    return;
                                }
                            });

                        socket.emit('getIdResult', result._id);
                        socket.broadcast.emit('updateVote', result);

                    });
                }

            });

        });
    }
});

module.exports = router;