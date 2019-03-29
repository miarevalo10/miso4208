let mongoose = require('mongoose');

let testSchema = new mongoose.Schema({
    timestamp: Date,
    apkVersion: String,
    seed: Number
  })

module.exports = mongoose.model('monkeytest', testSchema)
