/* jshint esnext: true */
'use strict';
var http = require('http');
var express = require('express');
var app = express();

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var socketIo = require('socket.io');
var passportSocketIo = require('passport.socketio');
var session = require('express-session');
var mongoose = require('mongoose');
var passport = require('passport');
var routes = require('./routes');


var port = process.env.PORT || 3000;
var env = process.env.NODE_ENV || 'development';
var secret = process.env.SECRET || '$uper $ecret';
var sessionKey = 'express.sid';


//var middleware = require('./lib/mw')();
var admin_middleware = require('./lib/mw_admin')();
var waist_middleware = require('./lib/mw_waist')();
var arbiter_middleware = require('./lib/mw_arbiter')();


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');


app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    resave: true,
    saveUninitialized: true,
    key: sessionKey,
    secret: secret
}));
app.use(express.static('public'));



//app.use(middleware);

app.use('/admin', admin_middleware);
app.use('/arbiter', waist_middleware);
app.use('/waist', waist_middleware);


server.listen(3000, function () {
    console.log('Serwer pod adresem http://localhost:3000/');
});