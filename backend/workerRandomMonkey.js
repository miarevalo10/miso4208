var AWS = require('aws-sdk');
const fs = require('fs')
var shell = require('shelljs');

AWS.config.update({ region: 'us-west-2' });
var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
var s3 = new AWS.S3();


var params = {
  QueueUrl: process.env.SQS_RANDOM_MONKEY
};

launchEmulator();

var receiptHandle = "";

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
  shell.exec(adb + ' shell monkey -p ' + packageName + ' -v ' + events);
  deleteMessage();
}

const downloadFile = (test) => {
  console.log('test',test);
  var params = {
    Bucket: 'pruebas-autom',
    Key: 'apks/' + test.apkName
  };

  shell.mkdir('apks');
  const filePath = "apks/" + test.apkName;
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


