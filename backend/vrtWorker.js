var AWS = require('aws-sdk');
const compareImages = require("resemblejs/compareImages");
const fs = require("mz/fs")
var shell = require('shelljs');

var params = {
    QueueUrl: process.env.SQS_VRT
};

AWS.config.update({ region: 'us-west-2' });

var s3 = new AWS.S3();
var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });


var fileName1 = "./images/v1";
var fileName2 = "./images/v2";

var t = setInterval(rcvMsg, 2000);

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

async function getDiff(img1, img2) {
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
        await fs.readFile(img1),
        await fs.readFile(img2),
        options
    );

    await fs.writeFile("./images/output.png", data.getBuffer());
    uploadImage("./images/output.png");
}

//Subir screenshots a s3
function uploadImage(file) {
    fs.readFile(file, function (err, data) {
        if (err) { throw err; }
        var params = {
            Bucket: 'pruebas-autom',
            Key: `vrt/test/output.png`,
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

async function downloadImages(fileNames) {
    var fileName = fileNames.pop();

    var params = {
        Bucket: 'pruebas-autom',
        Key: `vrt/test/${fileName}`
    };
    console.log('keyyyy', params.Key);
    shell.mkdir('images');
    const filePath = `./images/${fileName}`;
    s3.getObject(params, (err, data) => {
        if (err) console.error(err)
        else {
            console.log('Starting images download');
            fs.writeFile(filePath, data.Body, (err) => {
                shell.exec(`unzip -o images/${fileName} -d images`);
                console.log(`${filePath} has been created!`)
                if (fileNames.length == 0) {
                    console.log('length 0')
                    getDiff(`${fileName1}/test1.jpg`, `${fileName2}/test2.jpg`);
                } else {
                    console.log('length >0')
                    downloadImages(filenames);
                }
            })
        }
    })
}

