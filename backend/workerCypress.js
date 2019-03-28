var AWS = require('aws-sdk');
const fs = require('fs')
var shell = require('shelljs');
var AdmZip = require('adm-zip');

AWS.config.update({ region: 'us-west-2' });
var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
var s3 = new AWS.S3();


var params = {
  QueueUrl: process.env.SQS_CYPRESS
};

var receiptHandle = "";
const basePath = './cypress/'

const rcvMsg = () => {
  sqs.receiveMessage(params, function (err, data) {
    if (err) console.log(err, err.stack);
    else {
      if (data.Messages) {
        var test = data.Messages[0].Body;
        console.log('msg rcv', JSON.parse(test));
        receiptHandle = data.Messages[0].ReceiptHandle;
        downloadFile(JSON.parse(test));

      } else {
        console.log('no new msgs');
      }
    }
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

var t = setInterval(rcvMsg, 2000);

function unzipFile(data) {
  const filePath = basePath + data.testingSet
  var zip = new AdmZip(filePath);
  zip.extractAllTo(basePath, true);
}

function runTestingSet(data) {
  shell.cd(basePath + data.project)
  shell.exec('npm i')
  shell.exec('npx cypress run .').output
  deleteMessage()
}

const downloadFile = (data) => {
  console.log('data', data);
  var params = {
    Bucket: 'pruebas-autom',
    Key: 'cypress/' + data.testingSet
  };

  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath);
  }
  const filePath = basePath + data.testingSet
  s3.getObject(params, (err, data) => {
    if (err) console.error(err)
    else {
      console.log('Starting ' + data.testingSet + ' download');
      fs.writeFileSync(filePath, data.Body.toString())
      console.log(`${filePath} has been created!`)
      unzipFile(data)
      runTestingSet(data)
    }
  })
}