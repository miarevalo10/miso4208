var AWS = require('aws-sdk');
const fs = require('fs')
const path = require('path');
var shell = require('shelljs');
var AdmZip = require('adm-zip');
let db = require('./database');
const uuidv1 = require('uuid/v1')

AWS.config.update({ region: 'us-west-2' });
var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
var s3 = new AWS.S3();

const basePath = './cypress/'
const cypressConfig = '/cypress.json'
const FEATURE_TOKEN = "Feature:"
const URL_FRONT = 'http://localhost:5000/'
const SCREENSHOTS_FOLDER = basePath + 'screenshots/'
const REPORTS = 'reports/'
const REPORTS_FOLDER = basePath + REPORTS
const HTML_REPORTS_FOLDER = REPORTS_FOLDER + 'html/'
const BUCKET_NAME = 'pruebas-autom'
const FOLDER_S3 = 'cypress/'
const URL_S3 = 'https://s3-us-west-2.amazonaws.com/' + BUCKET_NAME + "/"
const FILENAME_REPORT = 'index.html'

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

var t = setInterval(rcvMsg, 2000);

function unzipFile(data) {
  const filePath = basePath + data.testingSet
  let projectPath = filePath.replace(".zip", "")
  if (fs.existsSync(projectPath)) {
    shell.exec('rm -r ' + projectPath)
  }
  var zip = new AdmZip(filePath);
  zip.extractAllTo(basePath, true);
}

function runTestingSet(data) {
  shell.cd(basePath + data.project)
  shell.exec('npm i')
  addReportConfiguration(data)
  replaceCypressCucumbreLibrary()
  //cleanProject()
  shell.exec('npx cypress run .').output
  shell.exec('rsync -a --delete ./cypress/results/ ./cypress/results_db/')
  changeResultsContextAndFolders('cypress/results/', listFeaturesFiles('cypress/integration/'), data)
  changeResultsContextAndFolders('cypress/results_db/', listFeaturesFiles('cypress/integration/'), data, true)
  shell.exec('npx mochawesome-merge --reportDir cypress/results > mochawesome.json')
  shell.exec('npx mochawesome-merge --reportDir cypress/results_db > mochawesome_db.json')
  shell.exec('npx mochawesome-report-generator -i mochawesome.json -f ' + FILENAME_REPORT + ' -o ' + REPORTS)
  uploadFileToS3(REPORTS + FILENAME_REPORT, s3Path(data) + REPORTS, "text/html");
  updateProcess(data)
  deleteMessage()
}

function cleanProject() {
  shell.exec('rm -r cypress/results')
  shell.exec('rm -r cypress/results_db')
  shell.exec('rm -r ' + SCREENSHOTS_FOLDER)
  shell.exec('rm -r ' + REPORTS_FOLDER)
  shell.exec('rm -r mochawesome-report')
  shell.exec('rm mochawesome_db.json')
  shell.exec('rm mochawesome.json')
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

function changeResultsContextAndFolders(dir, lstFiles, data, includeDetail = false) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    let content = fs.readFileSync(dir + file)
    let result = JSON.parse(content)
    let feature = result.suites.suites[0]
    let baseDir = SCREENSHOTS_FOLDER + lstFiles[feature.title]
    for (let test of feature.tests) {
      let s3basePath = s3Path(data)
      let s3ReportsHTMLPath = s3basePath + HTML_REPORTS_FOLDER.replace(basePath, "")

      test.context = '{\"title\": \"Detail\",\"value\": \"' + URL_S3 + s3ReportsHTMLPath + test.uuid + '.html' + '\"}'
      let testFolder = baseDir + "/" + test.title + "/"
      if (includeDetail && fs.existsSync(testFolder)) {
        if (!fs.existsSync(REPORTS_FOLDER)) {
          fs.mkdirSync(REPORTS_FOLDER);
        }
        let jsonTest = REPORTS_FOLDER + test.uuid + '.json'
        shell.exec('cp ./../../template_files/mochawesome.json ' + jsonTest)
        let contentTest = fs.readFileSync(jsonTest)
        let resultTest = JSON.parse(contentTest)
        let testInfo = resultTest.suites.suites[0]
        testInfo.title = test.title
        testInfo.duration = test.duration

        let stepTemplate = JSON.stringify(testInfo.tests[0]);
        testInfo.tests = []

        const scrsFiles = fs.readdirSync(testFolder);
        let s3ScreenshotsPath = s3basePath + testFolder.replace(basePath, "")
        let detail = test.detail
        if (!detail) detail = []
        for (const scrsFile of scrsFiles) {
          var step = { order: scrsFile.substr(0, 3), name: scrsFile.substr(3, scrsFile.length), screenshot: URL_S3 + s3ScreenshotsPath + scrsFile }
          detail.push(step)
          uploadFileToS3(testFolder + scrsFile, s3ScreenshotsPath, "image/png")

          let stepInfo = JSON.parse(stepTemplate)
          stepInfo.title = step.name
          stepInfo.fullTitle = step.name
          stepInfo.uuid = uuidv1()
          stepInfo.context = '{\"title\": \"Screenshot\",\"value\": \"' + step.screenshot + '\"}'
          testInfo.tests.push(stepInfo)
        }
        test.detail = detail
        fs.writeFileSync(jsonTest, JSON.stringify(resultTest, null, 4))
        shell.exec('npx mochawesome-report-generator -i ' + jsonTest + ' -o ' + HTML_REPORTS_FOLDER)
        uploadFileToS3(HTML_REPORTS_FOLDER + test.uuid + '.html', s3ReportsHTMLPath, "text/html")
      }
    }
    fs.writeFileSync(dir + file, JSON.stringify(result, null, 4))
  }
}

function s3Path(data) {
  return FOLDER_S3 + data.projectId + "/process/" + data.processId + "/"
}

function updateProcess(data) {
  let content = fs.readFileSync('mochawesome_db.json')
  let result = JSON.parse(content)

  let process = db.getProcess(data.projectId, data.processId)
  process.child('result').set(result)
  process.child('report').set(URL_S3 + s3Path(data) + REPORTS_FOLDER.replace(basePath, "") + 'index.html')
  process.update({ state: "Terminated" })
}

function uploadFileToS3(filePath, s3Path, contentType) {
  var fileName = path.basename(filePath)
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
//downloadFile({projectId: '-LbQxpuXbI9dVHD83BjD', processId:'-LbQz51NGkxz15rhwLAU', testingSet: 'cucumber-cypress.zip', project: 'cucumber-cypress'});


