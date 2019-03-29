var AWS = require('aws-sdk');
const fs = require('fs')
var shell = require('shelljs');
var TestModel = require('./models/testMonkey');
let db = require('./database');

AWS.config.update({ region: 'us-west-2' });
var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
var s3 = new AWS.S3();

var params = {
  QueueUrl: process.env.SQS_RANDOM_MONKEY
};

//launchEmulator();

var receiptHandle = "";
const basePath = './apks/'


const rcvMsg = () => {
  sqs.receiveMessage(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else {
      if (data.Messages) {
        var test = data.Messages[0].Body;
        console.log('msg rcv', JSON.parse(test));
        receiptHandle = data.Messages[0].ReceiptHandle;
        downloadFile( JSON.parse(test));

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
  shell.exec(adb + ' shell monkey -p ' + packageName + ' -s ' + seedRandom + ' -v ' + events );
  let msg = new TestModel({
    timestamp: Date.now(),
    apkVersion: apkName,
    seed: seedRandom
  });
  console.log('msg',msg);
  msg.save()
   .then(doc => {
     console.log('docsaveddd',doc);
   })
   .catch(err => {
     console.error(err)
   })

  //deleteMessage();
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
