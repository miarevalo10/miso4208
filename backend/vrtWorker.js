var AWS = require('aws-sdk');
const compareImages = require("resemblejs/compareImages");
const fs = require("mz/fs")
var shell = require('shelljs');
var AdmZip = require('adm-zip');
let db = require('./database');
var VRTModel = require('./models/testVRT');

var params = {
    QueueUrl: process.env.SQS_VRT
};

AWS.config.update({ region: 'us-west-2' });

var s3 = new AWS.S3();
var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
const basePath = './vrt/';
const featuresFile = 'features.zip';
var cont = 0;

/**
 * Msg example expected from queue
 * { apkv1: 'me.kuehle.carreport_79.apk', apkv2: 'me.kuehle.carreport_79.apk', features: 'test/features.zip' }
 */

launchEmulator();
createVRTFolder();

var t = setInterval(rcvMsg, 2000);

function rcvMsg() {
    sqs.receiveMessage(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else {
            if (data.Messages) {
                var test = data.Messages[0].Body;
                console.log('msg rcv', JSON.parse(test));
                receiptHandle = data.Messages[0].ReceiptHandle;
                //                downloadAll({ apkv1: 'me.kuehle.carreport_79.apk', apkv2: 'me.kuehle.carreport_79.apk', features: 'test/features.zip' })
                downloadApk(JSON.parse(test));
            } else {
                console.log('no new msgs');
            }
        }
    });
}

function createVRTFolder() {
    if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath);
    }
    shell.cd(basePath);
}

function launchEmulator() {
    var emulatorName = process.argv[2];
    var emulatorTool = process.env.ANDROID_TOOLS + './emulator';
    shell.exec(emulatorTool + ' -avd ' + emulatorName, { async: true });
}


function downloadApk(test) {
    if (cont == 0 || cont == 1) {
        if (cont == 0) {
            apkName = test.apkv1;
            cont++;
        } else if (cont == 1) {
            apkName = test.apkv2;
            cont++;
        }

        var params = {
            Bucket: 'pruebas-autom',
            Key: 'apks/' + apkName
        };
        console.log('key', params.Key);

        const filePath = apkName;
        console.log('filepath', filePath);
        s3.getObject(params, (err, data) => {
            if (err) console.error(err)
            else {
                console.log('Starting ' + apkName + ' download');
                fs.writeFileSync(filePath, data.Body);
                console.log(`${filePath} has been created!`);
                resignApk(apkName);
                downloadApk(test);
            }
        })
    } else if (cont == 2) {
        downloadFeatures(test);
    }
}

function downloadFeatures(test) {
    var params = {
        Bucket: 'pruebas-autom',
        Key: 'vrt/' + test.features
    };
    console.log('key', params.Key);

    const filePath = featuresFile;
    s3.getObject(params, (err, data) => {
        if (err) console.error(err)
        else {
            console.log('Starting features download');
            fs.writeFileSync(filePath, data.Body);
            unzipFile(featuresFile);
            runCalabash(test.apkv1, './v1');
            runCalabash(test.apkv2, './v2');
            compareAllImages(test);
        }
    })
}

function unzipFile(location) {
    const filePath = location;
    console.log(filePath, 'filepath')
    var zip = new AdmZip(filePath);
    zip.extractAllTo('./', true);
}


function createVersionFolder(folderName) {
    if (!fs.existsSync(folderName)) {
        fs.mkdirSync(folderName);
    }
    shell.mv('screenshot*', folderName);
}


function resignApk(apkName) {
    console.log('resign app', apkName);
    shell.exec(`calabash-android resign ${apkName}`);
}

function runCalabash(apkName, version) {
    console.log('starting to run calabash');
    shell.exec(`calabash-android run ${apkName}`);
    createVersionFolder(version);

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
         console.log('doc saved',doc);
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

