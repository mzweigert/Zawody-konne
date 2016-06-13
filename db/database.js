/* jshint node: true, esnext: true */

var mongoose = require('mongoose');


var userSchema = mongoose.Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true, select: false },
    role: { type: String, required: true, select: false },
});


var horseSchema = mongoose.Schema({
    name: String,
    gender: String,
    breeder: String
});

var competitionSchema = mongoose.Schema({
    meta: {
        name: { type: String, required: true },
        startDate: { type: String, required: true },
        startHour: { type: String, required: true},
        arbitersCount: { type:Number, min: 5, required: true },
        ratesType: {type: String, required: true},
        started: {type: Boolean, default: false},
        finished: {type: Boolean, default: false},

    },
    startList:{
        
        referringHorses: [{horse:{type: mongoose.Schema.Types.ObjectId, ref: 'Horse'}, startNumber: Number}],
        currentVoteHorse: {type: mongoose.Schema.Types.ObjectId, ref: 'Horse'},
        groups: [{
            name: { type: String, required: true },
            gender: { type: String, required: true },
            horses: [{type: mongoose.Schema.Types.ObjectId, ref: 'Horse', unique: true}],
            arbiters: [{type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true}],
        }]
    }

});

var resultSchema = mongoose.Schema({
    compId : {type: mongoose.Schema.Types.ObjectId, ref: 'Competition'},
    horseId : {type: mongoose.Schema.Types.ObjectId, ref: 'Horse'},
    arbiterId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    type: {type:Number},
    head: {type:Number},
    neck: {type:Number},
    body: {type:Number},
    legs: {type:Number},
    movement: {type:Number}
});

mongoose.connect('mongodb://localhost/horse-competition', () => {
    console.log('Nazwiązano połączenie z mongodb.');
});

var User = mongoose.model('User', userSchema),
    Horse = mongoose.model('Horse', horseSchema),
    Result = mongoose.model('Result', resultSchema),
    Competition = mongoose.model('Competition', competitionSchema);

exports.User = User;
exports.Horse = Horse;
exports.Result = Result;
exports.Competition = Competition;
exports.mongoose = mongoose;
