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
        'meta.finished' : false,
        'startList.groups.arbiters': req.user._id }, 'meta startList')
        .exec((err, found) => {


        if(err)
            return res.status(400).json(err);
        if(!found){
            return res.render('arbiter/arbiter', {
                result: {
                    arbiterId: req.user._id,
                    compId: undefined,
                    horseId: undefined,
                    ratesType: undefined
                }
            });
        }
        if(!found.startList.currentVoteHorse){
            return res.render('arbiter/arbiter', {
                result: {
                    arbiterId: req.user._id,
                    compId: undefined,
                    horseId: undefined,
                    ratesType: found.meta.ratesType
                }
            });
        }

        db.Result.findOne({ compId: found._id, 
                           arbiterId: req.user._id,
                           horseId: found.startList.currentVoteHorse })
            .exec((err, result) => {

            if(!result){
                return res.render('arbiter/arbiter', {
                    result: {
                        arbiterId: req.user._id,
                        compId: undefined,
                        horseId: undefined,
                        ratesType: found.meta.ratesType
                    }
                });
            }

            let horseWithSN = _.find(found.startList.referringHorses, (elem) => {
                return elem.horse.toString() === found.startList.currentVoteHorse.toString();
            }), resToObj = result.toObject();


            resToObj.horseId = horseWithSN;
            resToObj.ratesType = found.meta.ratesType;

            res.render('arbiter/arbiter', { result: resToObj });
        });

    });
});
io.sockets.on('connection', (socket) => {

    let user = socket.request.user;

    if(user.role === "arbiter") {

        socket.on('vote', (result) => {

            async.waterfall([
                (callback)=> {

                    if(result.compId === 'undefined'){
                        socket.emit('err', { err: 'Brak Id!', status: 404});
                        return;
                    }
                    db.Competition.findById(result.compId)
                        .exec((err, comp) =>{

                        if(err){
                            socket.emit('err', { err: err, status: 400});
                            return;
                        }
                        if(!comp){
                            socket.emit('err', { err: 'Nie znaleziono zawodów!', status: 404});
                            return;
                        }
                        if(!comp.startList.currentVoteHorse){
                            socket.emit('err', { err: 'Koń o id = ' + result.horseId + 'Zawody akutalnie nie posiadają ocenianego konia', status: 404});
                            return;
                        }
                        if(comp.startList.currentVoteHorse.toString() !== result.horseId){
                            socket.emit('err', { err: 'Koń o id = ' + result.horseId + ' nie jest aktualnie ocenianym koniem w zawodach', status: 404});
                            return;
                        }


                        callback(null, comp);
                    });
                },
                (comp, callback) => {

        
                    db.Result.findOne({ compId: comp._id, 
                                       arbiterId: user._id,
                                       horseId: comp.startList.currentVoteHorse })
                        .populate('horseId')
                        .exec((err, resFound) => {

                      
                        if(!resFound){
                            socket.emit('currentHorse', { err: 'Nie oceniasz teraz żadnego konia.', status: 404});
                            return;
                        }
                        else{
                            //BARDZO WAŻNE ZAPISANIE ID ZALOGOWANEGO UZYTKOWNIKA
                              
                            result.arbiterId = user._id;
                     console.log(result);
                            db.Result.findOneAndUpdate({_id: resFound._id}, result, {new:true})
                                .populate('arbiterId')
                                .exec((err, result) => {
                                    
                                if(err){
                                    socket.emit('err', { err: err, status: 400});
                                    return;
                                }
                                socket.broadcast.emit('updateVoteComp-'+comp._id , result);
                            });
                        }

                    });

                }
            ]);
        });
    }
});

module.exports = router;