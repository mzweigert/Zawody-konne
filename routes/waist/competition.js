/*jshint node: true, esnext: true */
// poniżej użylismy krótszej (niż na wykładzie) formy
// module.exports ==> exports
var express = require('express'),
    passport = require('../../config/passportconfig.js'),
    db = require('../../db/database.js'),
    router = express.Router();

router.get('/:id',  (req, res) => {
    if(req.params.id === undefined){
        res.status(404).send('No content');
    }
    db.Competition.findById(req.params.id)
    .populate('startList.groups.horses')
    .exec((err, found) => {

        if(err)
            return res.status(404).json(err);

        res.status(200).json({
            currentVoteHorse: found.startList.currentVoteHorse,
            groups: found.startList.groups

        });

    });
});

module.exports = router;