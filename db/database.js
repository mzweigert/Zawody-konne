var mongoose = require('mongoose');

var horseSchema = mongoose.Schema({
    name: String,
    gender: String,
    breeder: String
});

var arbiterSchema = mongoose.Schema({
    name: String,
    surname: String,
    idLog: String
});

var competitionSchema = mongoose.Schema({
    meta: {
        name: String,
        startDate: Date,
        arbittersCount: { type:Number, min: 5}
    },
    group: {
        name: String,
        gender: String,
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


var Horse = mongoose.model('Horse', horseSchema);
var Arbiter = mongoose.model('Arbiter', arbiterSchema);
var Competition = mongoose.model('Competition', competitionSchema);

exports.Horse = Horse;
exports.Arbiter = Arbiter;
exports.Competition = Competition;
exports.mongoose = mongoose;
