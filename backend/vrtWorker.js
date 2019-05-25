var AWS = require('aws-sdk');
const compareImages = require("resemblejs/compareImages");
const resemble = require("resemblejs");

const fs = require("mz/fs")
var shell = require('shelljs');
var AdmZip = require('adm-zip');
let db = require('./database');
var VRTModel = require('./models/testVRT');
const dotenv = require('dotenv');
dotenv.config();
const _ = require('lodash');


AWS.config.update({
    region: 'us-west-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

var params = {
    QueueUrl: process.env.SQS_VRT
};

AWS.config.update({ region: 'us-west-2' });

var s3 = new AWS.S3();
var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
const basePath = './vrt/';
const BUCKET_NAME = 'pruebas-autom';
const URL_S3 = 'https://s3-us-west-2.amazonaws.com/' + BUCKET_NAME + "/"

/**
 * Msg example expected from queue
 * {"versionOneId":"-LdUxhUHPhzUHzD-0OaQ","versionTwoId":"-LdUxhUHPhzUHzD-0OaQ",
 * "processOneId":"-LdV5bXOZ8wCPYK-w7br","processTwoId":"-LdV5bXOZ8wCPYK-w7br",
 * "projectId":"-LbQxpuXbI9dVHD83BjD","vrtProcessId":"-LfRLt61UV8bH0ZWr3kW"}
 */
// {"versionOneId":"-LdUxhUHPhzUHzD-0OaQ","versionTwoId":"-LdUxhUHPhzUHzD-0OaQ","processOneId":"-LfRjVR7VmB_NZpTlxxl","processTwoId":"-LfRjVR7VmB_NZpTlxxl","projectId":"-LbQxpuXbI9dVHD83BjD","vrtProcessId":"-Lfje33Sx6yjCf3BtW11","type":"cypress"}

const examplejson = {
    versionOneId: "-LdUxhUHPhzUHzD-0OaQ",
    versionTwoId: "-LdUxhUHPhzUHzD-0OaQ",
    processOneId: "-LfRjVR7VmB_NZpTlxxl",
    processTwoId: "-LfRjVR7VmB_NZpTlxxl",
    projectId: "-Lfje33Sx6yjCf3BtW11",
    vrtProcessId: "-LfRLt61UV8bH0ZWr3kW",
    type: 'cypress'
}

const report = [];
imgKeys = [];
promises = [];
folder_s3 = 'cypress/'

var t = setInterval(rcvMsg, 2000);
//runVrt(examplejson);

createVRTFolder();

function rcvMsg() {
    sqs.receiveMessage(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else {
            if (data.Messages) {
                var test = data.Messages[0].Body;
                console.log('msg rcv', JSON.parse(test));
                receiptHandle = data.Messages[0].ReceiptHandle;
                testObj = JSON.parse(test);
                if (testObj.type !== '') {
                    folder_s3 = `${testObj.type}/`;
                }
                runVrt(testObj);
                deleteMessage();
            } else {
                console.log('no new msgs');
            }
        }
    });
}

//runVrt(examplejson);

function runVrt(testObj) {
    db.updateVrtProcess(testObj.projectId, testObj.vrtProcessId, 'In progress');
    listFeatures(testObj);
}

function createVRTFolder() {
    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath);
    }
    shell.cd(basePath);
}

function listFeatures(data) {
    const testData = data;
    var params = {
        Bucket: BUCKET_NAME,
        Prefix: getS3Path(data.projectId, data.versionOneId, data.processOneId)
    };

    s3.listObjectsV2(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else {
            data.Contents.forEach(file => {
                console.log('list objectsss', file);
                fileArr = file.Key.split('/screenshots/');
                if (fileArr.length > 0) {
                    imgKeys.push(fileArr[1]);
                }
            });
            buildJson(testData);
            compareAllImages(testData).then(results => {
                uploadFile('report.json', `${folder_s3}${testData.projectId}/vrt/${testData.vrtProcessId}/report.json`, 'application/json');
                console.log('Test finished!!!');
                updateTerminatedProcess(testData);
            });
        }
    });
}

function getS3Path(projectId, versionId, processId) {
    return `${folder_s3}${projectId}/versions/${versionId}/process/${processId}/screenshots`;
}

function buildJson(data) {
    var v1path = getS3Path(data.projectId, data.versionOneId, data.processOneId);
    var v2path = getS3Path(data.projectId, data.versionTwoId, data.processTwoId);
    var diffPath = `${folder_s3}${data.projectId}/vrt/${data.vrtProcessId}/screenshots`;

    imgKeys.forEach(img => {
        var imgArr = img.split('/');
        var featName = imgArr[0];
        var scenarioName = imgArr[1];
        var imgName = imgArr[2];
        var v1ImgPath = `${v1path}/${img}`;
        var v2ImgPath = `${v2path}/${img}`;
        var diffImgPath = `${diffPath}/${img}`

        if (!(_.find(report, { name: featName }))) {
            report.push({ name: featName, scenarios: [] });
        }

        var scenarios = _.find(report, { name: featName }).scenarios;
        if (!(_.find(scenarios, { name: scenarioName }))) {
            scenarios.push({ name: scenarioName, screenshots: [] });
        }

        var screenshots = _.find(scenarios, { name: scenarioName }).screenshots;
        screenshots.push({ name: imgName, v1: v1ImgPath, v2: v2ImgPath, diff: diffImgPath, diffData: '' });
    });
}


async function compareAllImages(test) {

    let cont = report.length;
    let promises = [];
    report.forEach(feature => {

        if (!fs.existsSync(feature.name)) {
            fs.mkdirSync(feature.name);
        }
        shell.cd(feature.name);

        feature.scenarios.forEach(scenario => {
            if (!fs.existsSync(scenario.name)) {
                fs.mkdirSync(scenario.name);
            }
            shell.cd(scenario.name);

            scenario.screenshots.forEach(screenshot => {
                var name = screenshot.name.split('.png')[0];
                if (!fs.existsSync(name)) {
                    fs.mkdirSync(name);
                }
                shell.cd(name);
                var img1Path = `${feature.name}/${scenario.name}/${name}/v1-${screenshot.name}`;
                var img2Path = `${feature.name}/${scenario.name}/${name}/v2-${screenshot.name}`;
                var diffPath = `${feature.name}/${scenario.name}/${name}/diff-${screenshot.name}`;
                console.log('############')
                async function downloadImages() {
                    await downloadImage(screenshot.v1, `${feature.name}/${scenario.name}/${name}/v1-${screenshot.name}`);
                    await downloadImage(screenshot.v2, `${feature.name}/${scenario.name}/${name}/v2-${screenshot.name}`);
                    getDiff(img1Path, img2Path, diffPath, screenshot.diff, feature).then(data => {
                        console.log('dataaa', data)
                        addDiffData(feature.name, scenario.name, screenshot.name, data);
                        console.log('report-----', screenshot);
                    });
                }
                promises.push(downloadImages().then(diff => {
                    fs.writeFileSync('report.json', JSON.stringify(report), 'utf8');
                    cont--;
                }));
                shell.cd('..');

            });
            shell.cd('..');
        });
        shell.cd('..');
    });
    return Promise.all(promises);


}

function addDiffData(featName, sceName, ssName, diff) {
    console.log('ADD DIFF', featName, sceName, ssName)
    _.find(_.find(_.find(report, { 'name': featName }).scenarios, { 'name': sceName }).screenshots, { 'name': ssName }).diffData = diff;
}
function downloadImage(key, imgName) {

    var params = {
        Bucket: 'pruebas-autom',
        Key: key
    };

    return new Promise((resolve, reject) => s3.getObject(params, (err, data) => {
        if (err) {
            reject(err);
        }
        else {
            fs.writeFileSync(imgName, data.Body);
            resolve(data);
        }
    })
    );
}

async function getDiff(img1, img2, output, s3key, screenshot) {

    const options = {
        output: {
            errorColor: {
                red: 255,
                green: 0,
                blue: 255
            },
            errorType: "movement",
            transparency: 0.3,
            largeImageThreshold: 1200,
            useCrossOrigin: false,
            outputDiff: true
        },
        scaleToSameSize: true,
        ignore: "less"
    };

    const data = await compareImages(
        fs.readFileSync(img1),
        fs.readFileSync(img2),
        options
    );
    fs.writeFileSync(output, data.getBuffer());
    uploadFile(output, s3key, 'image/png');
    return data;
/*
{
  misMatchPercentage : 100, // %
  isSameDimensions: true, // or false
  dimensionDifference: { width: 0, height: -1 }, // defined if dimensions are not the same
  getImageDataUrl: function(){}
}
*/

}

var uploadFile = function (file, s3key, contentType) {
    fs.readFile(file, function (err, data) {
        if (err) { throw err; }
        var params = {
            Bucket: 'pruebas-autom',
            Key: s3key,
            Body: data,
            ContentType: contentType,
            ACL: 'public-read'
        };

        return new Promise((resolve, reject) => {
            s3.putObject(params, function (err, data) {
                if (err) {
                    reject(err);
                } else {
                    console.log("Successfully uploaded data ", s3key);
                    resolve(data);
                }

            });
        });

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

function updateTerminatedProcess(data) {
    let process = db.getVrtProcess(data.projectId, data.vrtProcessId);
    console.log('udpate terminated process');
    process.child('report').set(URL_S3 + `${folder_s3}${data.projectId}/vrt/${data.vrtProcessId}/report.json`)
    process.update({ state: "Terminated" })
}




