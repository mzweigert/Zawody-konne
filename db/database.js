/* jshint node: true, esnext: true */

var mongoose = require('mongoose');


var userSchema = mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true, select: false }
});


var horseSchema = mongoose.Schema({
    name: String,
    gender: String,
    breeder: String
});

var arbiterSchema = mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    idLog: { type: String, required: true },
});

var competitionSchema = mongoose.Schema({
    meta: {
        name: { type: String, required: true },
        startDate: { type: Date, required: true },
        arbittersCount: { type:Number, min: 5, required: true }
    },
    group: {
        name: { type: String, required: true },
        gender: { type: String, required: true },
        horses: [{horse:{type: mongoose.Schema.Types.ObjectId, ref: 'Horse'}, startNumber: Number}],
        arbiters: [{type: mongoose.Schema.Types.ObjectId, ref: 'Arbiter'}]
    }
    
    
});

mongoose.connect('mongodb://localhost/horse-competition', () => {
  console.log('Nazwiązano połączenie z mongodb.');
});


//var connectToDB = (callback) => {
//    mongoose.connect('mongodb://localhost/test');
//    var db = mongoose.connection;
//    db.on('error', console.error.bind(console, 'connection error:'));
//    db.on('open', callback);
//};


var User = mongoose.model('User', userSchema),
    Horse = mongoose.model('Horse', horseSchema),
    Arbiter = mongoose.model('Arbiter', arbiterSchema),
    Competition = mongoose.model('Competition', competitionSchema);

exports.User = User;
exports.Horse = Horse;
exports.Arbiter = Arbiter;
exports.Competition = Competition;
exports.mongoose = mongoose;
