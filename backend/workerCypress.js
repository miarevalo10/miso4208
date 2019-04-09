var AWS = require('aws-sdk');
const fs = require('fs')
const path = require('path');
var shell = require('shelljs');
var AdmZip = require('adm-zip');
let db = require('./database');

AWS.config.update({ region: 'us-west-2' });
var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
var s3 = new AWS.S3();

const basePath = './cypress/'
const cypressConfig = '/cypress.json'
const FEATURE_TOKEN = "Feature:"
const URL_FRONT = 'http://localhost:5000/'
const SCREENSHOTS_FOLDER = './cypress/screenshots/'
const BUCKET_NAME = 'pruebas-autom'
const FOLDER_S3 = 'cypress/'
const URL_S3 = 'https://s3-us-west-2.amazonaws.com/' + BUCKET_NAME + "/"

var params = {
  QueueUrl: process.env.SQS_CYPRESS
};

var receiptHandle = "";
const basePath = './cypress/';

/**
 * Msg example expected from queue
 * {projectId: '-LbQxpuXbI9dVHD83BjD', processId:'-LbQz51NGkxz15rhwLAU', 
 *  testingSet: 'cucumber-cypress.zip', project: 'cucumber-cypress'}
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
  shell.cd(basePath + data.project)
  shell.exec('npm i')
  addReportConfiguration(data)
  replaceCypressCucumbreLibrary()
  shell.exec('rm -r cypress/results')
  shell.exec('rm -r cypress/screenshots')
  shell.exec('npx cypress run .').output
  changeResultsContextAndFolders('cypress/results/', listFeaturesFiles('cypress/integration/'), data)
  shell.exec('npx mochawesome-merge --reportDir cypress/results > mochawesome.json')
  shell.exec('npx mochawesome-report-generator -i  mochawesome.json')
  updateProcess(data)
  deleteMessage()
}

const downloadFile = (data) => {
  console.log('data', data);
  var params = {
    Bucket: BUCKET_NAME,
    Key: FOLDER_S3 + data.testingSet
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
    overwrite: false,
    html: false,
    json: true
  }
  fs.writeFileSync(cypressConfigFile, JSON.stringify(cypress_cfg, null, 4))
  shell.exec('npm install --save-dev mocha@5.2.0 mochawesome@3.1.1')
  shell.exec('npm install --save-dev mochawesome-merge mochawesome-report-generator')
}

function replaceCypressCucumbreLibrary() {
  shell.exec('rsync -a --delete ../../cypress-cucumber-preprocessor node_modules/')
}

function listFeaturesFiles(dir) {
  let lstFiles = {}
  const files = fs.readdirSync(dir);
  for (const file of files) {
    var array = fs.readFileSync(dir + file).toString().split('\n');
    for (let line of array) {
      if (line.trim().startsWith(FEATURE_TOKEN)) {
        lstFiles[line.replace(FEATURE_TOKEN, "").trim()] = file
        break;
      }
    }
  }
  return lstFiles;
}

function changeResultsContextAndFolders(dir, lstFiles, data) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    let content = fs.readFileSync(dir + file)
    let result = JSON.parse(content)
    let feature = result.suites.suites[0]
    let baseDir = SCREENSHOTS_FOLDER + lstFiles[feature.title]
    if (fs.existsSync(baseDir)) {
      fs.renameSync(baseDir, SCREENSHOTS_FOLDER + feature.uuid)
      baseDir = SCREENSHOTS_FOLDER + feature.uuid
  }
  for (let test of feature.tests) {
      test.context = '{\"title\": \"Detail:\",\"value\": \"' + URL_FRONT + test.uuid + '\"}'
      let testFolder = baseDir + "/" + test.title + "/"
      if (fs.existsSync(testFolder)) {
          const scrsFiles = fs.readdirSync(testFolder);
          let s3Path = FOLDER_S3 + data.projectId + "/process/" + data.processId + "/" + testFolder.replace(SCREENSHOTS_FOLDER, "")
          let detail = test.detail
          if (!detail) detail = []
          for (const scrsFile of scrsFiles) {
              var step = { order: scrsFile.substr(0, 3), name: scrsFile.substr(3, scrsFile.length), screenshot: URL_S3 + s3Path + scrsFile }
              detail.push(step)
              uploadScreenshotStep(testFolder + scrsFile, s3Path, test)
          }
          test.detail = detail
      }
  }
  fs.writeFileSync(dir + file, JSON.stringify(result, null, 4))
  }
}

function updateProcess(data) {
  let content = fs.readFileSync('mochawesome.json')
  let result = JSON.parse(content)

  let process = db.getProcess(data.projectId, data.processId)
  process.child('result').set(result)
  process.update({ state: "Terminated" })
}

function uploadScreenshotStep(filePath, s3Path, test) {
  var fileName = path.basename(filePath)
  var params = {
      Bucket: BUCKET_NAME,
      Body: fs.createReadStream(filePath),
      Key: s3Path + fileName
  };

  s3.upload(params, function (err, data) {
      if (err) console.log("Error", err);
  });
}
//downloadFile({projectId: '-LbQxpuXbI9dVHD83BjD', processId:'-LbQz51NGkxz15rhwLAU', testingSet: 'cucumber-cypress.zip', project: 'cucumber-cypress'});


