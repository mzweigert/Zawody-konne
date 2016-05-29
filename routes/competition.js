/*jshint node: true, esnext: true */
// poniżej użylismy krótszej (niż na wykładzie) formy
// module.exports ==> exports
var express = require('express'),
    passport = require('../config/passportconfig.js'),
    db = require('../db/database.js'),
    router = express.Router();

router.get('/:id',  (req, res) => {
    if(req.param('id') === undefined){
        res.status(404).send('No content');
    }
    db.Competition.findById(req.param('id'), (err, found) => {
       
        console.log(found);
        if(err)
            res.status(404).json(err);
        else
            res.render('competition', {
                title: found.meta.name,
                group: found.group

            });

    });
});

module.exports = router;