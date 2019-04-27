var AWS = require('aws-sdk');
const fs = require('fs')
var shell = require('shelljs');
let db = require('./database');
const path = require('path');

AWS.config.update({ region: 'us-west-2' });
var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
var s3 = new AWS.S3();

var params = {
  QueueUrl: process.env.SQS_RANDOM_MONKEY
};

//launchEmulator();

var receiptHandle = "";
const basePath = './apks/';
var testObj = {};
const BUCKET_NAME = 'pruebas-autom'
const URL_S3 = 'https://s3-us-west-2.amazonaws.com/' + BUCKET_NAME + "/";
const FOLDER_S3 = 'random/';


const rcvMsg = () => {
  sqs.receiveMessage(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else {
      if (data.Messages) {
        var test = data.Messages[0].Body;
        console.log('msg rcv', JSON.parse(test));
        receiptHandle = data.Messages[0].ReceiptHandle;
        testObj = JSON.parse(test);
        db.updateProcess(testObj.projectId,testObj.versionId,testObj.processId,'In progress');
        downloadFile( testObj);

      } else {
        console.log('no new msgs');
      }
    }
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

var t = setInterval(rcvMsg, 2000);

function launchEmulator() {
  var emulatorName = process.argv[2];
  var emulatorTool = process.env.ANDROID_TOOLS + './emulator';
  shell.exec(emulatorTool + ' -avd ' + emulatorName, { async: true });
}

function runMonkeyTest(events, packageName, apkName) {

  var adb = process.env.ANDROID_PLATFORM_TOOLS + './adb';
  console.log('installing', shell.exec(adb + ' install apks/' + apkName).stdout);
  const seedRandom = getRandomInt(1, 100000);
  shell.exec(adb + ' shell monkey -p ' + packageName + ' -s ' + seedRandom + ' -v ' + events + ' >> results.txt');
  uploadFileToS3('results.txt', s3Path(testObj), 'text');
  updateProcess(testObj);
  deleteMessage();
}

const downloadFile = (test) => {
  console.log('test',test);
  var params = {
    Bucket: 'pruebas-autom',
    Key: 'apks/' + test.apkName
  };
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath);
  }
  const filePath = basePath + test.apkName;
  s3.getObject(params, (err, data) => {
    if (err) console.error(err)
    else {
      console.log('Starting ' + test.apkName + ' download');
      fs.writeFileSync(filePath, data.Body.toString())
      console.log(`${filePath} has been created!`)
      runMonkeyTest(test.events, test.packageName, test.apkName);
    }
  })
}

const getRandomInt = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function s3Path(data) {
  return FOLDER_S3 + data.projectId + "/version/"+data.versionId +"/process/" + data.processId + "/"
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

function updateProcess(data) {
  let process = db.getProcess(data.projectId,data.versionId ,data.processId);
  process.child('report').set(URL_S3 + s3Path(data) + 'report.txt');
  db.updateProcess(data.projectId,data.versionId ,data.processId, 'Finished');
  console.log(`Process ${data.processId} terminated`);
}