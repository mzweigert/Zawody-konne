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

    let body = req.body;
    if(!body.username  || 
       !body.password  || 
       !body.firstname || 
       !body.lastname  || 
       !body.role) {
        return res.status(400).send('Uzupełnij wszystkie pola!');
    }
    if(body.username.length < 2 || body.username.length > 10){
        return res.status(400).send('Username musi miec minimum 5 i maksimum 10 znakow');
    }
    if(body.firstname.length < 2 || body.firstname.length > 30 || body.lastname .length < 2 || body.lastname.length > 30){
        return res.status(400).send('Imie i nazwisko musi miec minimum 2 znaki i maksium 30 znakow!');
    }
    if( body.role !== 'admin' && body.role !== 'arbiter') {
        return res.status(400).send('Nieprawidlowa rola!');
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

    db.User.findById(req.param('id'), (err, found) => {

        if(err)
            res.status(400).json(err);
        else
            res.status(200).json(found);  
    });
});
router.put('/updateUser', (req, res) => {

    let body = req.body;
    
    if(req.body.id === req.user.id){
        return res.status(400).send('Nie mozesz zmienić swoich danych, gdy jestes zalogowany!');
    }
    if(!body.id        ||
       !body.username  || 
       !body.password  || 
       !body.firstname || 
       !body.lastname  || 
       !body.role) {
        return res.status(400).send('Uzupełnij wszystkie pola!');
    }
    if(body.username.length < 2 || body.username.length > 10){
        return res.status(400).send('Username musi miec minimum 5 i maksimum 10 znakow');
    }
    if(body.firstname.length < 2 || body.firstname.length > 30 || body.lastname .length < 2 || body.lastname.length > 30){
        return res.status(400).send('Imie i nazwisko musi miec minimum 2 znaki i maksium 30 znakow!');
    }
    if( body.role !== 'admin' && body.role !== 'arbiter') {
        return res.status(400).send('Nieprawidlowa rola!');
    }


    db.User.findById(req.body.id, 'password', (err, found) => {

        found.username = req.body.username;
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
