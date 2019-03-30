let mongoose = require('mongoose');

let testSchema = new mongoose.Schema({
    timestamp: Date,
    apkVersion: String,
    output: String
  })

module.exports = mongoose.model('vrttest', testSchema)
