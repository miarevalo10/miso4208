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

const basePath = './calabash/';
const featuresFile = 'features.zip';
const BUCKET_NAME = 'pruebas-autom'
const URL_S3 = 'https://s3-us-west-2.amazonaws.com/' + BUCKET_NAME + "/";
const FOLDER_S3 = 'calabash/';

/**
* Msg example expected from queue
* {projectId: '-Ldtest', processId:'-Ldtestp', 
*  testingSet: 'car_report_features2.zip', project: 'calabash-android', apkName: 'me.kuehle.carreport_79.apk' }
*/

const rcvMsg = () => {
  sqs.receiveMessage(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else {
      if (data.Messages) {
        var test = data.Messages[0].Body;
        console.log('msg rcv', JSON.parse(test));
        receiptHandle = data.Messages[0].ReceiptHandle;
        downloadApk(JSON.parse(test));
      } else {
        console.log('no new msgs');
      }
    }
  });
}
const downloadApk = (test) => {
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
      runTestingSet(test);
      rimraf.sync(basePath);
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

const runTestingSet = (test) => {
  shell.exec(`calabash-android run ${test.apkName} --format html --out report.html`);
  uploadFileToS3('report.html', s3Path(test), 'text/html');
  uploadImages(test);
  updateProcess(test);
}

function uploadImages(test) {
  fs.readdirSync('./').forEach(file => {
    if (file.match(/[\/.](gif|jpg|jpeg|tiff|png)$/i)) {
      uploadFileToS3(file, s3Path(test), 'image/png');
    }
  });
}

function updateProcess(data) {
  let process = db.getProcess(data.projectId, data.processId)
  process.child('report').set(URL_S3 + s3Path(data) + 'report.html')
  process.update({ state: "Terminated" })
}

function s3Path(data) {
  return FOLDER_S3 + data.projectId + "/process/" + data.processId + "/"
}

function uploadFileToS3(filePath, s3Path, contentType) {
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

// downloadApk( {projectId: '-Ldtest', processId:'-Ldtestp', 
// testingSet: 'car_report_features2.zip', project: 'calabash-android', apkName: 'me.kuehle.carreport_79.apk' })
