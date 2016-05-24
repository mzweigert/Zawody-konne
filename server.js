/* jshint esnext: true */
'use strict';
var http = require('http'),
    express = require('express'),
    app = express(),

    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),

    socketIo = require('socket.io'),
    passport = require('./config/passportconfig.js'),
    passportSocketIo = require('passport.socketio'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),

    sessionStore = new MongoStore({ 
        mongooseConnection: require('./db/database.js').mongoose.connection 
    }),

    sessionSecret = 'wielkiSekret44',
    sessionKey = 'express.sid';

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    resave: true,
    saveUninitialized: true,
    key: sessionKey,
    secret: sessionSecret,
    store: sessionStore
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));
app.post('/login',
    (passport.authenticate('local', {
        failureRedirect: '/login'
    }),
    function (req, res) {
        res.send('/authorized.html');
    })
);
app.use('/api', require('./routes'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

let server = http.createServer(app);
let sio = socketIo.listen(server);

let onAuthorizeSuccess = function (data, accept) {
    console.log('Udane połączenie z socket.io');
    accept(null, true);
};

let onAuthorizeFail = function (data, message, error, accept) {
    if (error) {
        throw new Error(message);
    }
    console.log('Nieudane połączenie z socket.io:', message);
    accept(null, false);
};

sio.use(passportSocketIo.authorize({
  cookieParser: cookieParser,       // the same cookieParser middleware as registered in express
  key:          sessionKey,         // the name of the cookie storing express/connect session_id
  secret:       sessionSecret,      // the session_secret used to parse the cookie
  store:        sessionStore,       // sessionstore – should not be memorystore!
  success:      onAuthorizeSuccess, // *optional* callback on success
  fail:         onAuthorizeFail     // *optional* callback on fail/error
}));


sio.set('log level', 2); // 3 == DEBUG, 2 == INFO, 1 == WARN, 0 == ERROR

sio.sockets.on('connection', function (socket) {
    socket.emit('news', {
        ahoj: 'od serwera'
    });
    socket.on('reply', function (data) {
        console.log(data);
    });
});

server.listen(3000, function () {
    console.log('Serwer pod adresem http://localhost:3000/');
});
