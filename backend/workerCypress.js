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
const basePath = './cypress/';

/**
 * Msg example expected from queue
 * {testingSet: 'cucumber-cypress.zip', project: 'cucumber-cypress'}
 */

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
  shell.cd(basePath+data.project)
  shell.exec('npm i')
  addReportConfiguration(data)
  replaceCypressCucumbreLibrary()
  shell.exec('rm -r cypress/results')
  shell.exec('rm -r cypress/screenshots')
  shell.exec('npx cypress run .').output
  shell.exec('npx mochawesome-merge --reportDir cypress/results > mochawesome.json')
  shell.exec('npx mochawesome-report-generator -i  mochawesome.json')
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
  s3.getObject(params, (err, dataS3) => {
    if (err) console.error(err)
    else {
      console.log('Starting ' + data.testingSet + ' download');
      fs.writeFileSync(filePath, dataS3.Body)
      console.log(`${filePath} has been created!`)
      unzipFile(data)
      runTestingSet(data)
    }
  })
}

function addReportConfiguration(data) {
  let cypressConfigFile = "." + cypressConfig
  let contenido = fs.readFileSync(cypressConfigFile)
  let cypress_cfg = JSON.parse(contenido)
  cypress_cfg.reporter = "mochawesome"
  cypress_cfg.reporterOptions = {
      reportDir: "cypress/results",
      overwrite: true,
      html: true,
      json: true
  }
  fs.writeFileSync(cypressConfigFile, JSON.stringify(cypress_cfg, null, 4))
  shell.exec('npm install --save-dev mocha@5.2.0 mochawesome@3.1.1')
  shell.exec('npm install --save-dev mochawesome-merge mochawesome-report-generator')
}

function replaceCypressCucumbreLibrary(){
  shell.exec('rsync -a --delete ../../cypress-cucumber-preprocessor node_modules/')
}

//downloadFile({testingSet: 'cucumber-cypress.zip', project: 'cucumber-cypress'});


