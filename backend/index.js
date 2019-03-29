const express = require("express");
const bodyParser = require("body-parser");
var morgan = require('morgan');
const fs = require('fs');
const fileType = require('file-type');
const bluebird = require('bluebird');
const multiparty = require('multiparty');

const API_PORT = 3001;
const app = express();
const router = express.Router();

var AWS = require('aws-sdk');
AWS.config.update({
    region: 'us-west-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});
AWS.config.setPromisesDependency(bluebird);
var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
const s3 = new AWS.S3();

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.use(morgan('combined'));

//CORS middleware
var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}

app.use(allowCrossDomain);

router.post("/sendTest", (req, res) => {
    // La idea sería mandar estos params desde el front
    console.log('sendtest', req.body.message);
    var msg = {
        "apkName": "me.kuehle.carreport_79.apk",
        "events": "1000",
        "packageName": "me.kuehle.carreport"
    }
    var msg = req.body.message;
    var params = {
        DelaySeconds: 0,
        MessageBody: JSON.stringify(msg),
        QueueUrl: process.env.SQS_RANDOM_MONKEY
    };

    sqs.sendMessage(params, function (err, data) {
        if (err) {
            console.log(err);
            res.json({ success: false, error: err }); ("Error", err);
        } else {
            console.log('success');
            return res.json({ success: true });
        }
    });
});

const uploadFile = (buffer, name, type) => {
    const params = {
        ACL: 'public-read',
        Body: buffer,
        Bucket: process.env.S3_BUCKET,
        ContentType: type.mime,
        Key: `${name}.${type.ext}`
    };
    return s3.upload(params).promise();
};

// Define POST route
router.post("/test-upload", (request, response) => {
    const form = new multiparty.Form();
    form.parse(request, async (error, fields, files) => {
        if (error) throw new Error(error);
        try {
            const path = files.file[0].path;
            const buffer = fs.readFileSync(path);
            const type = fileType(buffer);
            const timestamp = Date.now().toString();
            const fileName = `apks/${timestamp}-lg`;
            console.log("ok "+process.env.AWS_ACCESS_KEY_ID+" - "+ process.env.AWS_SECRET_ACCESS_KEY);
            const data = await uploadFile(buffer, fileName, type);
            return response.status(200).send(data);
        } catch (error) {
            console.log(error)
            return response.status(400).send(error);
        }
    });
});

router.post('/sendvrt', (req, res) => {
    var file1 = req.body.first_file;
    var file2 = req.body.second_file;
    var timestamp = + new Date();

    var myBucket = 'vrt';
    var myKey = 'file1_' + timestamp;
    var mySecondKey = 'file2_' + timestamp;

    params = { Bucket: myBucket, Key: myKey, Body: file1 };

    s3.putObject(params, function (err, data) {

        if (err) {

            console.log(err)

        } else {

            console.log("Successfully uploaded data to myBucket/myKey");

        }

    });

    params = { Bucket: myBucket, Key: mySecondKey, Body: file2 };

    s3.putObject(params, function (err, data) {

        if (err) {

            console.log(err)

        } else {

            console.log("Successfully uploaded data to myBucket/myKey");

        }

    });
});


// append /api for our http requests
app.use("/api", router);

// launch our backend into a port
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));