var AWS = require('aws-sdk');
const compareImages = require("resemblejs/compareImages");
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
const featuresFile = 'features.zip';
var cont = 0;
const BUCKET_NAME = 'pruebas-autom'
const FOLDER_S3 = 'cypress/'

/**
 * Msg example expected from queue
 * {"versionOneId":"-LdUxhUHPhzUHzD-0OaQ","versionTwoId":"-LdUxhUHPhzUHzD-0OaQ",
 * "processOneId":"-LdV5bXOZ8wCPYK-w7br","processTwoId":"-LdV5bXOZ8wCPYK-w7br",
 * "projectId":"-LbQxpuXbI9dVHD83BjD","vrtProcessId":"-LfRLt61UV8bH0ZWr3kW"}
 */

const examplejson = {
    versionOneId: "-LdUxhUHPhzUHzD-0OaQ",
    versionTwoId: "-LdUxhUHPhzUHzD-0OaQ",
    processOneId: "-LfRjVR7VmB_NZpTlxxl",
    processTwoId: "-LfRjVR7VmB_NZpTlxxl",
    projectId: "-LbQxpuXbI9dVHD83BjD",
    vrtProcessId: "-LfRLt61UV8bH0ZWr3kW"
}

const report = [];
imgKeys = [];
//launchEmulator();
//createVRTFolder();

//var t = setInterval(rcvMsg, 2000);



function rcvMsg() {
    sqs.receiveMessage(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else {
            if (data.Messages) {
                var test = data.Messages[0].Body;
                console.log('msg rcv', JSON.parse(test));
                receiptHandle = data.Messages[0].ReceiptHandle;
                testObj = JSON.parse(test);
                runVrt(testObj);
                //                downloadAll({ apkv1: 'me.kuehle.carreport_79.apk', apkv2: 'me.kuehle.carreport_79.apk', features: 'test/features.zip' })
                //downloadApk(JSON.parse(test));
            } else {
                console.log('no new msgs');
            }
        }
    });
}

runVrt(examplejson);

function runVrt(testObj) {
    createVRTFolder();
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
                fileArr = file.Key.split('/screenshots/');
                if (fileArr.length > 0) {
                    imgKeys.push(fileArr[1]);
                }
            });
            console.log('KEYS', imgKeys);
            buildJson(testData);
        }
    });
}

function getS3Path(projectId, versionId, processId) {
    return `${FOLDER_S3}${projectId}/versions/${versionId}/process/${processId}/screenshots`;
}

function buildJson(data) {
    console.log('que llega al json', data)
    var v1path = getS3Path(data.projectId, data.versionOneId, data.processOneId);
    var v2path = getS3Path(data.projectId, data.versionTwoId, data.processTwoId);
    var diffPath = `${FOLDER_S3}${data.projectId}/vrt/${data.vrtProcessId}/screenshots`


    imgKeys.forEach( img => {
        var imgArr = img.split('/');
        var featName = imgArr[0];
        var scenarioName = imgArr[1];
        var imgName = imgArr [2];
        var v1ImgPath = `${v1path}/${img}`;
        var v2ImgPath = `${v2path}/${img}`;
        var diffImgPath = `${diffPath}/${img}`
        
        if(!(_.find(report, {name:featName}))){
            report.push({name: featName, scenarios: []});
        }
        
        var scenarios = _.find(report, {name:featName}).scenarios;
        if(!(_.find(scenarios, {name:scenarioName}))){
            scenarios.push({name: scenarioName, screenshots: []});
        }

        var screenshots = _.find(scenarios, {name:scenarioName}).screenshots;
        screenshots.push({name: imgName, v1: v1ImgPath, v2:v2ImgPath, diff: diffImgPath});
        console.log('screenshots', screenshots);
    });

    fs.writeFile('report.json', JSON.stringify(report), 'utf8', (err) => {
        console.log('error', err);
    })
}













function compareAllImages(test) {
    if (!fs.existsSync('output')) {
        fs.mkdirSync('output');
    }
    fs.readdirSync('v1').forEach(file => {
        var ofileName = file.substr(0, file.lastIndexOf(".")) + ".png";
        getDiff(`./v1/${file}`, `./v2/${file}`, ofileName);
    });
    saveDB(test);
    deleteMessage();
}

function saveDB(test) {
    let test = new VRTModel({
        timestamp: Date.now(),
        apkV1: test.apkv1,
        apkV2: test.apkv2,
        output: 'vrt/test/output'
    });

    test.save()
        .then(doc => {
            console.log('doc saved', doc);
        })
        .catch(err => {
            console.error(err)
        })
}
async function getDiff(img1, img2, output) {
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
    fs.writeFileSync("./output/" + output, data.getBuffer());

    uploadImage("./output/" + output, output);
}

function uploadImage(file, name) {
    fs.readFile(file, function (err, data) {
        if (err) { throw err; }
        var params = {
            Bucket: 'pruebas-autom',
            Key: `vrt/test/output/${name}`,
            Body: data
        };

        s3.putObject(params, function (err, data) {
            if (err) {
                console.log(err)
            } else {
                console.log("Successfully uploaded data");
            }

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


function downloadImages(test) {

    var params = {
        Bucket: 'pruebas-autom',
        Key: `vrt/test/${test.imgLocation}`
    };
    console.log('key', params.Key);
    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath);
    }
    const filePath = basePath + test.imgLocation
    s3.getObject(params, (err, data) => {
        if (err) console.error(err)
        else {

            console.log('Starting images download');
            fs.writeFileSync(filePath, data.Body);
            unzipFile(test.imgLocation);
            compareAllImages('images');
        }
    })
}

