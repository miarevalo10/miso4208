var AWS = require('aws-sdk');
const fs = require('fs')
var shell = require('shelljs');
var AdmZip = require('adm-zip');
var rimraf = require("rimraf");

AWS.config.update({ region: 'us-west-2' });
var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
var s3 = new AWS.S3();


var params = {
  QueueUrl: process.env.SQS_CALABASH
};

const basePath = './calabash/';
const featuresFile = 'features.zip';


/**
 * Msg example expected from queue
 * { apkName: 'me.kuehle.carreport_79.apk', features: 'car_report_features.zip' }
 */

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
// Downloads features zip and saves it to calabash folder
const downloadFeatures = (test) => {
  var params = {
    Bucket: 'pruebas-autom',
    Key: 'calabash/' + test.features
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
      runTestingSet(test.apkName);
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

const runTestingSet = (apkName) => {
  shell.exec(`calabash-android run ${apkName}`)
}


downloadApk({ apkName: 'me.kuehle.carreport_79.apk', features: 'car_report_features.zip' })
// resigns apk
// runs calabash tests