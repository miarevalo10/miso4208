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
      process
    } = application;
    const ref = db.ref('projects/').push({
      name,
      type,
      applicationArchitecture,
      applicationLanguage,
      applicationDescription,
      minSdk,
      maxSdk,
      supportedBrowsers,
      process
    });
    return ref.key;
  }

  saveVersion(projectId, version) {
    const {
      apkFile, createdDate, name
    } = version
    console.log(`ref version ${projectId}`);
    if (apkFile) {
      return db.ref(`projects/${projectId}/versions`).push({
        apkFile, createdDate, name
      });
    } else {
      return db.ref(`projects/${projectId}/versions`).push({
        createdDate, name
      });
    }
  }

  saveProcess(process) {
    const refPush = `projects/${process.projectId}/versions/${process.versionKey}/process`;
    console.log(`ruta para push ${refPush}`);
    let dbProcess = {
      ...process,
      state: 'Sent',
      type: process.queue
    }
    if (process.queue === 'Monkey') {
      dbProcess = {
        events: process.events,
        seed: process.seed,
        state: 'Sent',
        type: process.queue
      }
    } else if (process.queue === 'Calabash') {
      dbProcess = {
        file: process.file,
        state: 'Sent',
        type: process.queue
      }
    }
    return db.ref(refPush).push(dbProcess).key;
  }

  updateProcess(projectId, versionId, processId, pstate) {
    let processStr = `projects/${projectId}/versions/${versionId}/process/${processId}`;
    console.log('update process', processStr);

    db.ref().child(processStr).update({ 'state': pstate, 'lastUpdate': new Date() }).then().catch();
  }

  getProcess(projectId, versionId, processId) {
    return db.ref('projects/' + projectId + "/versions/" + versionId + "/process/" + processId)
  }

  getApplications(callback) {
    return db.ref('projects/').once('value').then((snapshot) => {
      callback(snapshot)
    });
  }
}
module.exports = new Database()