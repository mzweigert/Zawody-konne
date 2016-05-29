/*jshint node: true, esnext: true*/
'use strict';
var express = require("express"),
    bCrypt   = require('bcrypt-nodejs'),
    db = require('../db/database.js'),
    mongoose = require('mongoose'),
    router = express.Router();

var createHash = function(password){
 return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};

router.get('/getAllUsers', (req, res) => {

    db.User.find({}, 'username password firstname lastname role', (err, users) => {

        if(err)
            res.status(404).json(err);
        else
            res.status(200).json(users); 
    });
});
router.post('/addUser', (req, res) => {

    if(req.body.username === undefined  || 
       req.body.password === undefined  || 
       req.body.firstname === undefined || 
       req.body.lastname === undefined  || 
       req.body.role === undefined) {

        res.status(400).send('Uzupełnij wszystkie pola!');
    }
    db.User.findOne({'username': req.body.username }, (err, user) => {

        if(user)
            res.status(400).send('Użytkownik o loginie ' + user.username + " istnieje już w bazie.");
        else {
            
            let user = new db.User({

                username: req.body.username,
                password: createHash(req.body.password),
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                role: req.body.role
            });

            user.save((err, user) => {
                
                if(err)
                    res.status(400).json(err);
                else
                    res.status(200).json(user);  
            });
        }
    });
});
router.delete('/deleteUser', (req, res) => {

    if(req.body.id === undefined){
        return res.status(400).send('No content');
    }

    if(req.body.id === req.user.id){
        return res.status(400).send('Nie mozesz usunac siebie');
    }
    

    db.User.findByIdAndRemove(req.body.id, (err) => {
        if(err)
            res.status(400).json(err);
        else
            res.status(200).json({ message: 'usunięto!' });  
    });
});

router.get('/findUserById/:id', (req, res) => {
    if(req.param('id') === undefined){
        res.status(400).send('No content');
    }

    db.Horse.findById(req.param('id'), (err, found) => {

        if(err)
            res.status(400).json(err);
        else
            res.status(200).json(found);  
    });
});
router.put('/updateUser', (req, res) => {

    if(req.body.id === undefined ||
       req.body.username === undefined  || 
       req.body.firstname === undefined || 
       req.body.lastname === undefined  || 
       req.body.role === undefined) {

        return res.status(400).send('Uzupełnij wszystkie pola!');
    }
    
    if(req.body.id === req.user.id){
        return res.status(400).send('Nie mozesz zmienić swoich danych, gdy jestes zalogowany!');
    }

    db.User.findById(req.body.id, 'password', (err, found) => {

 
        found.username = req.body.username;
        found.password = found.password;
        found.firstname = req.body.firstname;
        found.lastname = req.body.lastname;
        found.role = req.body.role;
        
        found.save((err) => {

            if(err)
                res.status(400).json(err);
            else
                res.status(200).json(found); 
        });

    });
});


module.exports = router;
