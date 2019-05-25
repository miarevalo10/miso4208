var AWS = require('aws-sdk');
const fs = require('fs')
var shell = require('shelljs');
var AdmZip = require('adm-zip');
var rimraf = require("rimraf");
const path = require('path');
let db = require('./database');
const dotenv = require('dotenv');
dotenv.config();

AWS.config.update({
  region: 'us-west-2',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
var s3 = new AWS.S3();

var params = {
  QueueUrl: process.env.SQS_CALABASH
};

const basePath = './calabash/';
const featuresFile = 'features.zip';
const BUCKET_NAME = 'pruebas-autom';
const URL_S3 = 'https://s3-us-west-2.amazonaws.com/' + BUCKET_NAME + "/";
const FOLDER_S3 = 'calabash/';
const HOOKS_FILE_NAME = 'app_life_cycle_hooks.rb';
const HOOKS_FOLDER = 'features/support/'
/**
* Msg example expected from queue
* {
//   projectId: '-LdQQIC-151ME1muI3rK', processId: '-LdUB5v1Afw7ebtryrX0', versionId: '-LdQQIC5TH6lLAcfSvEk',
//   testingSet: 'car_report_features2.zip', project: 'calabash-android', apkName: 'me.kuehle.carreport_79.apk'
// }
*/

var t = setInterval(rcvMsg, 2000);
changeFolder();
downloadHooksCalabash();

const test = {
  projectId: '-LdQQIC-151ME1muI3rK', processId: '-LdUB5v1Afw7ebtryrX0', versionId: '-LdQQIC5TH6lLAcfSvEk',
  testingSet: 'car_report_features2.zip', project: 'calabash-android', apkName: 'me.kuehle.carreport_79.apk'
};

function rcvMsg() {
  sqs.receiveMessage(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else {
      if (data.Messages) {
        var test = data.Messages[0].Body;
        console.log('msg rcv', JSON.parse(test));
        receiptHandle = data.Messages[0].ReceiptHandle;
        var testObj = JSON.parse(test);
        db.updateProcess(testObj.projectId, testObj.versionId, testObj.processId, 'In progress');
        downloadApk(testObj);
      } else {
        delete
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

  const filePath = test.apkName;
  if (!fs.existsSync(filePath)) {
    s3.getObject(params, (err, data) => {
      if (err) console.error(err)
      else {
        console.log('Starting ' + test.apkName + ' download');
        fs.writeFileSync(filePath, data.Body)
        console.log(`${filePath} has been created!`);
        downloadFeatures(test);
      }
    });
  } else {
    downloadFeatures(test);
  }
}

function changeFolder() {
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath);
  }
  shell.cd(basePath)
}

const downloadFeatures = (test) => {
  var params = {
    Bucket: 'pruebas-autom',
    Key: 'scripts/' + test.testingSet
  };
  console.log('key', params.Key);

  const filePath = featuresFile;
  const hooksOld = HOOKS_FOLDER + HOOKS_FILE_NAME;
  s3.getObject(params, (err, data) => {
    if (err) console.error(err)
    else {
      console.log('Starting features download');
      fs.writeFileSync(filePath, data.Body);
      unzipFile(featuresFile);
      fs.copyFileSync(HOOKS_FILE_NAME, hooksOld);
      resignApk(test.apkName);
      runTestingSet(test);
    }
  })
}

function deleteFiles() {

  fs.readdir('./', (err, files) => {
    if (err) throw err;

    for (const file of files) {
      if (!fs.existsSync(file)) {
        if (fs.lstatSync(file).isDirectory()) {
          rimraf.sync(file);
        } else if (file !== HOOKS_FILE_NAME) {
          fs.unlinkSync(path.join('./', file));
        }
      }
    }
  });
}

function downloadHooksCalabash() {
  if (!fs.existsSync(HOOKS_FILE_NAME)) {
    var params = {
      Bucket: 'pruebas-autom',
      Key: 'scripts/' + HOOKS_FILE_NAME
    };
    console.log('key', params.Key);
    const filePath = HOOKS_FILE_NAME;
    s3.getObject(params, (err, data) => {
      if (err) console.error(err)
      else {
        console.log('Starting hooks download');
        fs.writeFileSync(filePath, data.Body);
      }
    })
  }
}

function unzipFile(location) {
  const filePath = location;
  console.log(filePath, 'filepath')
  var zip = new AdmZip(filePath);
  zip.extractAllTo('./', true);
}

const resignApk = (apkName) => {
  console.log('resign app', apkName);
  shell.exec(`calabash-android resign ${apkName}`);
}

const runTestingSet = (test) => {
  console.log('running test suite', shell.exec(`calabash-android run ${test.apkName} --format html --out report.html`).stdout);
  uploadFileToS3('report.html', s3Path(test), "text/html");
  uploadImages(test);

}

function uploadImages(test) {
  fs.readdirSync('./').forEach(file => {
    if (file.match(/[\/.](gif|jpg|jpeg|tiff|png)$/i)) {
      uploadFileToS3(file, s3Path(test), "image/png");
    }
  });
  uploadDir('screenshots', test);
}

function finishTest(test) {
  updateProcess(test);
  deleteMessage();
  deleteFiles();
}
function updateProcess(data) {
  let process = db.getProcess(data.projectId, data.versionId, data.processId);
  process.child('report').set(URL_S3 + s3Path(data) + 'report.html');
  db.updateProcess(data.projectId, data.versionId, data.processId, 'Terminated');
  console.log(`Process ${data.processId} terminated`);
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


function deleteMessage() {
  var deleteParams = {
    QueueUrl: params.QueueUrl,
    ReceiptHandle: receiptHandle
  };

  sqs.deleteMessage(deleteParams, function (err, data) {
    if (err) {
      console.log("Delete Error", err);
    } else {
      console.log("Message Deleted", data);
    }
  });
}

function uploadDir(dir, data) {

  function walkSync(currentDirPath, callback) {
    fs.readdirSync(currentDirPath).forEach(function (name) {
      var filePath = path.join(currentDirPath, name);
      var stat = fs.statSync(filePath);
      if (stat.isFile()) {
        callback(filePath, stat);
      } else if (stat.isDirectory()) {
        walkSync(filePath, callback);
      }
    });
    finishTest(data);
  }
  function s3Path(data) {
    return FOLDER_S3 + data.projectId + "/versions/" + data.versionId + "/process/" + data.processId + "/screenshots/"
  }
  walkSync(dir, function (filePath) {
    let bucketPath = s3Path(data) + filePath.substring(dir.length + 1);
    let params = { Bucket: BUCKET_NAME, Key: bucketPath, Body: fs.readFileSync(filePath), ContentType: 'image/png',
      ACL: 'public-read' };
    s3.putObject(params, function (err, data) {
      if (err) {
        console.log(err)
      } else {
        //console.log('Successfully uploaded ' + bucketPath + ' to ' + BUCKET_NAME);
      }
    });
  });
};

function s3Path(data) {
  return FOLDER_S3 + data.projectId + "/versions/" + data.versionId + "/process/" + data.processId + "/"
}

// downloadApk({
//   projectId: '-LdQQIC-151ME1muI3rK', processId: '-LdUB5v1Afw7ebtryrX0', versionId: '-LdQQIC5TH6lLAcfSvEk',
//   testingSet: 'car_report_features2.zip', project: 'calabash-android', apkName: 'me.kuehle.carreport_79.apk'
// })