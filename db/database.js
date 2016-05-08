var mongoose = require('mongoose');

var horseSchema = mongoose.Schema({
    name: String,
    gender: String,
    breeder: String
});

var arbiterSchema = mongoose.Schema({
    name: String,
    surname: String,
    id: String
});

var competitionSchema = mongoose.Schema({
    meta: {
        name: String,
        startDate: Date,
        arbittersCount: { type:Number, min: 5}
    },
    startList: {
     
        horses: [{horse:{type: mongoose.Schema.Types.ObjectId, ref: 'Horse'}, startNumber: Number}]
    }
    
    
});

var Horse = mongoose.model('Horse', horseSchema);
var Arbiter = mongoose.model('Arbiter', arbiterSchema);
var Competition = mongoose.model('Competition', competitionSchema);

exports.Horse = Horse;
exports.Arbiter = Arbiter;
exports.Competition = Competition;

