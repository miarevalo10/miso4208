var AWS = require('aws-sdk');
const fs = require('fs')
var shell = require('shelljs');

AWS.config.update({ region: 'us-west-2' });
var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
var s3 = new AWS.S3()


var params = {
  QueueUrl: process.env.SQS_CALABASH
};


// Downloads features zip and saves it to calabash folder
const downloadFeatures = (test) => {
  var params = {
    Bucket: 'pruebas-autom',
    Key: 'calabash/car_report_features.zip'
  };
  console.log('keyyyy', params.Key);
  shell.mkdir('calabash');
  const filePath = "calabash/car_report_features.zip";
  s3.getObject(params, (err, data) => {
    if (err) console.error(err)
    else {
      console.log('Starting features download');
      fs.writeFile(filePath, data.Body.toString(), (err) => {
        shell.exec('unzip calabash/features.zip');
        console.log(`${filePath} has been created!`)
      })

    }
  })
}

// Downloads apk
const downloadApk = (test) => {
  var params = {
    Bucket: 'pruebas-autom',
    Key: 'apks/' + test.apkName
  };
  console.log('keyyyy', params.Key);
  shell.mkdir('calabash');
  const filePath = "calabash/" + test.apkName;
  s3.getObject(params, (err, data) => {
    if (err) console.error(err)
    else {
      console.log('Starting ' + test.apkName + ' download');
      fs.writeFileSync(filePath, data.Body.toString())
      console.log(`${filePath} has been created!`);
      downloadFeatures();
    }
  })
}

downloadApk({ apkName: "me.kuehle.carreport_79.apk" })
// resigns apk
// runs calabash tests