var AWS = require('aws-sdk');
const compareImages = require("resemblejs/compareImages");
const fs = require("mz/fs")
var shell = require('shelljs');
var AdmZip = require('adm-zip');

var params = {
    QueueUrl: process.env.SQS_VRT
};

AWS.config.update({ region: 'us-west-2' });

var s3 = new AWS.S3();
var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
const basePath = './vrt/';


//var t = setInterval(rcvMsg, 2000);

function rcvMsg() {
    sqs.receiveMessage(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else {
            if (data.Messages) {
                var test = data.Messages[0].Body;
                console.log('msg rcv', JSON.parse(test));
                receiptHandle = data.Messages[0].ReceiptHandle;
                filenames = [JSON.parse(test).fileName1, JSON.parse(test).fileName2]
                downloadImages(filenames);


            } else {
                console.log('no new msgs');
            }
        }
    });
}

async function getDiff(img1, img2, output) {
    console.log('comparing ', img1, 'agaisnt', img2);
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

    // The parameters can be Node Buffers
    // data is the same as usual with an additional getBuffer() function
    const data = await compareImages(
        fs.readFileSync(img1),
        fs.readFileSync(img2),
        options
    );

    console.log('tempfilename', output);
    fs.writeFileSync("./output/"+output, data.getBuffer());

    uploadImage("./output/"+output, output);
}

//Subir screenshots a s3
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

function downloadImages(test) {

    var params = {
        Bucket: 'pruebas-autom',
        Key: `vrt/test/${test.imgLocation}`
    };
    console.log('keyyyy', params.Key);
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

function compareAllImages(folderName) {
    console.log('path images', basePath + folderName);
    shell.cd(basePath + folderName);
    if (!fs.existsSync('output')) {
        fs.mkdirSync('output');
    }

    fs.readdirSync('v1').forEach(file => {
        console.log(file);
        var ofileName = file.substr(0, file.lastIndexOf(".")) + ".png";

        getDiff(`./v1/${file}`, `./v2/${file}`, ofileName);
    });
}

function unzipFile(location) {
    const filePath = basePath + location;
    console.log(filePath, 'filepath')
    var zip = new AdmZip(filePath);
    zip.extractAllTo(basePath, true);
}


downloadImages({ imgLocation: 'images.zip' })

