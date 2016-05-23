/* jshint esnext: true */
'use strict';
var express = require('express');
var app = express();

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var socketIo = require('socket.io');
var passportSocketIo = require('passport.socketio');
var session = require('express-session');
var passport = require('passport');



var port = process.env.PORT || 3000;
var env = process.env.NODE_ENV || 'development';
var secret = process.env.SECRET || '$uper $ecret';
var sessionKey = 'express.sid';

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    resave: true,
    saveUninitialized: true,
    key: sessionKey,
    secret: secret
}));
app.use(express.static('public'));

app.use('/api', require('./routes'));

app.listen(3000, function () {
    console.log('Serwer pod adresem http://localhost:3000/');
});