let mongoose = require('mongoose'); 
const uri = "mongodb+srv://pruebas:pruebas123@cluster0-vwiez.mongodb.net/pruebasautom?retryWrites=true";

class Database {
  constructor() {
    this._connect()
  }
_connect() {
    console.log('mongooosee');
     mongoose.connect(uri,{ useNewUrlParser: true })
       .then(() => {
         console.log('Database connection successful')
       })
       .catch(err => {
         console.error('Database connection error')
       })
  }
}
module.exports = new Database()