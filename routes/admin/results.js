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
        .populate('startList.referringHorses.horse')
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

        let horsesWithSN,
            groups = found.startList.groups.map((elem) => {
                let obj = elem.toObject();

                horsesWithSN = _.filter(found.startList.referringHorses, (SLHorse) => {
                    return _.find(elem.horses, (horse) => {
                        return horse._id.toString() === SLHorse.horse._id.toString();
                    });
                });
                obj.horses = horsesWithSN;

                return obj;
            });

        if(found.meta.finished){
            return res.render('admin/results', {
                compId: found._id,
                groups: groups,
                finished: true
            });  
        }

        return res.render('admin/results', {
            compId: found._id,
            groups: groups,
            currentHorse: found.startList.currentVoteHorse,
            finished: false
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



let create = (endCallback, comp, group, socket) => {

    async.waterfall([
        (callback) => {


            db.Result.find({compId: comp._id}, (err, results) => {

                //WYCIAGAMY NIEOCENIONE KONIE Z GRUPY 
                let notRatedHorses = _.filter(group.horses, (gHorse) => {
                    return !_.find(results, (res) => {
                        return res.horseId.toString() === gHorse.toString();
                    });
                });
                if(!notRatedHorses.length){
                    if((results.length/comp.meta.arbitersCount) === comp.startList.referringHorses.length){
                        comp.meta.finished = true;
                        socket.emit('endComp-'+comp._id);
                    } 
                    endCallback();

                }
                else{
                    callback(null, comp, group, notRatedHorses[0]);
                }


            });

        },
        (comp, group, horseId, callback) => {


            db.Horse.findById(horseId, (err, found) => {
                if(err){
                    socket.emit('err', { err: err, status: 400});
                    return;
                }
                if(!found){
                    socket.emit('err', { err: 'Nie znaleziono konia!', status: 404});
                    return;
                }
                if(!comp.meta.started){
                    comp.meta.started = true;
                    comp.meta.finished = false;
                }


                comp.startList.currentVoteHorse = found;
                socket.emit('setCurrHorse-'+comp._id, { horseToSet: found._id }  );
                callback(null, comp, group);

            });

        },
        (comp, group, callback) => {

            comp.save((err, saved) => {

                if(err){
                    socket.emit('err', { err: err, status: 400});
                    return;
                }

                let resArray = [],
                    horseWithSN = _.find(saved.startList.referringHorses, (elem) => {
                        return elem.horse.toString() === saved.startList.currentVoteHorse._id.toString();  
                    });

                group.arbiters.forEach((arbiter) => {
                    let result = {
                        compId: comp._id,
                        arbiterId: arbiter,
                        horseId: comp.startList.currentVoteHorse._id
                    };
                    resArray.push(result); 
                });

                callback(null, resArray, horseWithSN, saved.meta.ratesType);
            });

        }, 
        (resArray, horseWithSN, ratesType) => {

            db.Result.insertMany(resArray, (err, saved) => {
                if(err){
                    socket.emit('err', { err: 'Nie zapisano wyników startowych!', status: 404});
                    return;
                }
                saved.forEach((result) => {

                    let resToObj = result.toObject();
                    resToObj.horseId = horseWithSN;
                    resToObj.ratesType = ratesType;
                    socket.broadcast.emit('canStartVote-'+result.arbiterId, { result: resToObj });
                });


            });
        }]);
};
io.on('connection', (socket) => { 
    let user = socket.request.user;

    if(user.role === 'admin'){
        socket.on('setCurrGroup', (data) => {

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
                                socket.emit('err', { err: 'Nie możesz już zmienić ocenianej grupy!', status: 400});
                                return;
                            }
                            if(found.meta.finished){
                                socket.emit('err', { err: 'Zawody skończone!', status: 400});
                                return;
                            }
                            let group = _.find(found.startList.groups, (group) => {
                                return group._id.toString() === data.groupId.toString();
                            });
                            if(!group){
                                socket.emit('err', { err: 'Nie można odnaleźć grupy!', status: 400});
                                return;
                            }
                            create(() => {
                                socket.emit('err', { err: 'Grupa została oceniona!', status: 400});
                                return;
                            }, found, group, socket);

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
                        if(!comp.startList.currentVoteHorse){
                            socket.emit('err', { err: 'Rozpocznij ocenianie grupy!', status: 404});
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
                            return (isNaN(result.type) || 
                                    isNaN(result.head) || 
                                    isNaN(result.neck) || 
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
                            let group = _.find(comp.startList.groups, (group) => {
                                return _.find(group.horses, (gHorse) => {
                                    return gHorse.toString() === comp.startList.currentVoteHorse.toString(); 
                                });
                            });

                            socket.broadcast.emit('calculate-'+group._id);
                            socket.broadcast.emit('updateHorse-'+group._id);     
                            
                            create(() => {

                                results.forEach((result) => {
                                    socket.broadcast.emit('canStartVote-' + result.arbiterId);
                                });

                                comp.startList.currentVoteHorse = undefined;
                                comp.save((err, saved) => {
                                    socket.emit('err', { err: 'Wszystkie konie z grupy zostały ocenione!', status: 404});
                                    socket.emit('setCurrHorse-' + compId);
                                });

                            }, comp, group, socket);

                        }
                    });
                }

            ]);

        });
    }
});

module.exports = router;
