var firebase = require('firebase-admin')
var db

var serviceAccount = require("./serviceAccountKey.json");

class Database {
  constructor() {
    this._connect()
  }
  _connect() {
    console.log('firebase');
    firebase.initializeApp({
      credential: firebase.credential.cert(serviceAccount),
      databaseURL: "https://pruebas-autom.firebaseio.com"
    });

    db = firebase.database();

    //var newProjectId = "-LbQxpuXbI9dVHD83BjD"

    /*var projects = db.ref('projects/')
    var newProjectId = projects.push().getKey()
    projects.child(newProjectId).set({name:"LimeSurvey", type:"web"})
    
    var versions = db.ref('projects/'+newProjectId+'/versions/')
    var newVersionId = versions.push().getKey()
    versions.child(newVersionId).set({name:"1.0"})
    
    var process = db.ref('projects/'+newProjectId+'/process/')
    var newProcessId = process.push().getKey()
    process.child(newProcessId).set({type:"BDT", state:"waiting", file:"cucumber-cypress.zip"})
    */

    /*db.ref('projects/').once('value').then(function (snapshot) {
      console.log(snapshot.val())
    })*/
  }

  getInstance() {
    return db;
  }

  saveApplication(application) {
    const {
      name,
      type,
      applicationArchitecture,
      applicationLanguage,
      applicationDescription,
      minSdk,
      maxSdk,
      supportedBrowsers,
      process,
      versions
    } = application;
    db.ref('projects/').push({
      name,
      type,
      applicationArchitecture,
      applicationLanguage,
      applicationDescription,
      minSdk,
      maxSdk,
      supportedBrowsers,
      process,
      versions
    });
  }

  getProcess(projectId, processId) {
    return db.ref('projects/' + projectId + "/process/" + processId)
  }

  getApplications(callback) {
    return db.ref('projects/').once('value').then((snapshot) => {
      callback(snapshot)
    });
  }
}
module.exports = new Database()