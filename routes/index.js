/*jshint node: true, esnext: true */
// poniżej użylismy krótszej (niż na wykładzie) formy
// module.exports ==> exports
var express = require('express'),
    admin   = require('./mw_admin.js'),
    arbiter = require('./mw_arbiter.js'),
    waist   = require('./mw_waist.js'),
    router = express.Router();


router.use('/admin', admin);
router.use('/arbiter', arbiter.index);
router.use('/waist', waist.index);

module.exports = router;