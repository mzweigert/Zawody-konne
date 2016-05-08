/*jshint node: true */
var mongoose = require('mongoose');
var dbsch = require('../db/database.js');
mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


module.exports = function () {
    // „next” poniżej oznacza kolejną wartswę – tutaj akurat jej nie
    // wykorzystujemy i moglibyśmy pominąć ją w liście parametrów
    return function (req, res, next) {
        switch (req.url) {
        case '/': // obsługa ścieżki „/admin/”
            res.header('Content-Type', 'text/plain; charset=utf-8');
            res.render('admin', {
               title: 'Admin'
            });
            break;
        default:
            res.header('Content-Type', 'application/json');
            res.json({"err": "NIE ma takiej strony!"});
        }
    };
};
