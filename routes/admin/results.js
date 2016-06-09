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
        .exec((err, found) => {

        if(err)
            return res.status(400).json(err);
        if(!found)
            return res.status(404);

        let  lenHorGr = 0;
        found.startList.groups.forEach((gr) => {
            lenHorGr += gr.horses.length;
        });

        if(lenHorGr !== found.startList.referringHorses.length)
            return res.status(400).send('Dodaj wsyzstkie konie do grup');

        res.render('admin/results', {
            idComp: found._id,
            groups: found.startList.groups
        });
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

    }
});

module.exports = router;
