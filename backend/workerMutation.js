var AWS = require('aws-sdk');
const fs = require('fs')
var shell = require('shelljs');
var AdmZip = require('adm-zip');
var rimraf = require("rimraf");
const path = require('path');
let db = require('./database');

AWS.config.update({ region: 'us-west-2' });
var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
var s3 = new AWS.S3();

var params = {
  QueueUrl: process.env.SQS_CALABASH
};

const basePath = './mutation/';
const mutantsPath = basePath + 'mutants/'
const featuresFile = 'features.zip';
const BUCKET_NAME = 'pruebas-autom'
const URL_S3 = 'https://s3-us-west-2.amazonaws.com/' + BUCKET_NAME + "/";
const FOLDER_S3 = 'mutation/';

/**
* Msg example expected from queue
* {projectId: '-Ldtest', 
*  processId:'-Ldtestp', 
*  testingSet: 'car_report_features2.zip', 
*  project: 'calabash-android', 
*  apkName: 'me.kuehle.carreport_79.apk',
*  appPackage: 'me.kuehle.carreport',
*  numMutants: 2,
*  seedMutants: 12345}
*/

var t = setInterval(rcvMsg, 2000);

function rcvMsg() {
  sqs.receiveMessage(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else {
      if (data.Messages) {
        var test = data.Messages[0].Body;
        console.log('msg rcv', JSON.parse(test));
        receiptHandle = data.Messages[0].ReceiptHandle;
        resetProject();
        downloadApk(JSON.parse(test));
      } else {
        console.log('no new msgs');
      }
    }
  });
}
const downloadApk = (test) => {
  let process = db.getProcess(test.projectId, test.processId)
  process.update({ state: "In execution" })

  var params = {
    Bucket: 'pruebas-autom',
    Key: 'apks/' + test.apkName
  };
  console.log('keyyyy', params.Key);
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath);
  }
  const filePath = basePath + test.apkName;
  s3.getObject(params, (err, data) => {
    if (err) console.error(err)
    else {
      console.log('Starting ' + test.apkName + ' download');
      fs.writeFileSync(filePath, data.Body)
      console.log(`${filePath} has been created!`);
      downloadFeatures(test);
    }
  })
}

const downloadFeatures = (test) => {
  // Validar si el set se va a tomar de s3 en calbash
  var params = {
    Bucket: 'pruebas-autom',
    Key: 'calabash/' + test.testingSet
  };
  console.log('keyyyy', params.Key);
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath);
  }
  const filePath = basePath + featuresFile;
  s3.getObject(params, (err, data) => {
    if (err) console.error(err)
    else {
      console.log('Starting features download', data);
      fs.writeFileSync(filePath, data.Body);
      unzipFile(featuresFile);
      shell.cd(basePath)
      resignApk(test.apkName);
      generateMutants(test)
      runTestingSet(test);
      //rimraf.sync(basePath);
    }
  })
}

function unzipFile(location) {
  const filePath = basePath + location;
  console.log(filePath, 'filepath')
  var zip = new AdmZip(filePath);
  zip.extractAllTo(basePath, true);
}

const resignApk = (apkName) => {
  console.log('resign app', apkName);
  shell.exec(`calabash-android resign ${apkName}`);
}

function resetProject() {
  shell.rm('-rf',MUTATION_PATH)
  shell.mkdir(MUTATION_PATH)  
}

function generateMutants(data) {
  shell.exec('java -jar mutapk/MutAPK-0.0.1.jar '+basePath+data.apkName+' '+data.appPackage+' '+mutantsPath+' mutapk/extra/ . true '+data.numMutants+' '+data.seedMutants+'').output
}

const runTestingSet = (test) => {
  for(var i = 1;i<=test.numMutants;i++){
    var mutantKey = test.appPackage+'-mutant'+i;
    var completePath = '.\\mutation\\mutants\\'+mutantKey+'\\'+ test.apkName;
    console.log(`calabash-android run ${completePath} --format html --out report-${mutantKey}.html`);
    resignApk(completePath);
    console.log('running test suite mutant ' + i , shell.exec(`calabash-android run ${completePath} --format html --out report-${mutantKey}.html`).stdout);
    uploadFileToS3('report-'+mutantKey+'.html', s3Path(test,mutantKey), 'text/html');
    uploadImages(test,mutantKey);
    updateProcess(test,mutantKey);
  }
  
  deleteMessage();
}

function uploadImages(test) {
  fs.readdirSync('./').forEach(file => {
    if (file.match(/[\/.](gif|jpg|jpeg|tiff|png)$/i)) {
      uploadFileToS3(file, s3Path(test,mutantKey), 'image/png');
    }
  });
}

function updateProcess(data, mutantKey) {
  let process = db.getProcess(data.projectId, data.processId)
  process.child('report').set(URL_S3 + s3Path(data,mutantKey) + 'report.html')
  process.update({ state: "Terminated" })
  console.log(`Process ${data.processId} terminated`);
}

function s3Path(data,mutantKey) {
  return FOLDER_S3 + data.projectId + "/process/" + data.processId + "/" + mutantKey
}

function uploadFileToS3(filePath, s3Path, contentType) {
  console.log(`uploading file ${filePath} to ~${s3Path}`);
  var fileName = path.basename(filePath);
  var params = {
    Bucket: BUCKET_NAME,
    Body: fs.createReadStream(filePath),
    Key: s3Path + fileName,
    ContentType: contentType,
    ACL: 'public-read'
  };

  s3.upload(params, function (err, data) {
    if (err) console.error("Error", err);
  });
}


function deleteMessage()  {
  var deleteParams = {
    QueueUrl: params.QueueUrl,
    ReceiptHandle: receiptHandle
  };

  sqs.deleteMessage(deleteParams, function(err, data) {
    if (err) {
      console.log("Delete Error", err);
    } else {
      console.log("Message Deleted", data);
    }
  });
}

// downloadApk( {projectId: '-Ldtest', processId:'-Ldtestp', 
// testingSet: 'car_report_features2.zip', project: 'calabash-android', apkName: 'me.kuehle.carreport_79.apk' })
