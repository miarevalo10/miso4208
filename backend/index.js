const express = require("express");
const bodyParser = require("body-parser");
var morgan = require('morgan');
const fs = require('fs');
const fileType = require('file-type');
const bluebird = require('bluebird');
const multiparty = require('multiparty');
const applications = require('./routes/applications');
var AWS = require('aws-sdk');
let db = require('./database');
const dotenv = require('dotenv');
const API_PORT = 3001;
const app = express();
const router = express.Router();

dotenv.config();

AWS.config.update({
    region: 'us-west-2',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});


AWS.config.setPromisesDependency(bluebird);
var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });
const s3 = new AWS.S3();

var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
}


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('combined'));
app.use(allowCrossDomain);

app.use('/applications', applications);

router.post("/sendTest", (req, res) => {
    console.log('sendtest', req.body);
    var msg = {};
    var queue = "";
    const processId = db.saveProcess(req.body);

    switch (req.body.queue) {
        case "Monkey":
            msg = {
                "apkName": req.body.apkFile,
                "events": req.body.events,
                "packageName": req.body.packageName,
                "seed": req.body.seed,
                "projectId": req.body.projectId,
                "versionId": req.body.versionKey,
                "processId": processId
            }
            queue = process.env.SQS_RANDOM_MONKEY;
            break;
        case "Cypress":
            msg = {
                "testingSet": req.body.file,
                "projectId": req.body.projectId,
                "versionId": req.body.versionKey,
                "processId": processId,
                "project": req.body.file.slice(0, -4)
            }
            queue = process.env.SQS_CYPRESS;
            break;
        case "Calabash":
            msg = {
                "apkName": req.body.apkFile,
                "projectId": req.body.projectId,
                "versionId": req.body.versionKey,
                "processId": processId,
                "testingSet": req.body.file,
            }
            queue = process.env.SQS_CALABASH;
            break;
        case "Random":
            msg = {
                "events": req.body.events,
                "seed": req.body.seed,
                "projectId": req.body.projectId,
                "versionId": req.body.versionKey,
                "processId": processId
            }
            queue = process.env.SQS_RANDOM_WEB;
            break;
        case "vrt":
            msg = {
                "versionOneId": req.body.versionOneId,
                "versionTwoId": req.body.versionTwoId,
                "processOneId": req.body.processOneId,
                "processTwoId": req.body.processTwoId,
                "projectId" : req.body.projectId,
                "vrtProcessId": processId,
                "type" : req.body.type
            }
            queue = process.env.SQS_VRT;
            break;
    }
    var params = {
        DelaySeconds: 0,
        MessageBody: JSON.stringify(msg),
        QueueUrl: queue
    };
    //console.log('Mesaggge sqsss', msg);

    sqs.sendMessage(params, function (err, data) {
        if (err) {
            console.log('sqs error msg ', err);
            res.json({ success: false, error: err }); ("Error", err);
        } else {
            console.log('success', data);
            return res.json({ success: true });
        }
    });
});


const uploadFile = (buffer, name, type) => {
    const params = {
        ACL: 'public-read',
        Body: buffer,
        Bucket: process.env.S3_BUCKET || "pruebas-autom",
        ContentType: type,
        Key: `${name}`
    };
    console.log('params upload', params);
    return s3.upload(params).promise();
};

// Define POST route
router.post("/apk-upload", (request, response) => {
    const form = new multiparty.Form();
    form.parse(request, async (error, fields, files) => {
        if (error) throw new Error(error);
        try {
            //console.log('FILESSSS', files)
            //console.log('headers', files.file[0].headers, files.file[0].headers['content-type']);

            const path = files.file[0].path;
            const buffer = fs.readFileSync(path);
            const type = files.file[0].headers['content-type'];
            //const timestamp = Date.now().toString();
            const name = files.file[0].originalFilename;

            const fileName = `apks/${name}`;

            const data = await uploadFile(buffer, fileName, type);

            return response.status(200).send(data);
        } catch (error) {
            console.log(error)
            return response.status(400).send(error);
        }
    });
});

// Define POST route
router.post("/script-upload", (request, response) => {
    const form = new multiparty.Form();
    form.parse(request, async (error, fields, files) => {
        if (error) throw new Error(error);
        try {
            //console.log('SCRIPT-UPLOAD',files);
            const path = files.file[0].path;
            const buffer = fs.readFileSync(path);
            const type = files.file[0].headers['content-type'];
            const name = files.file[0].originalFilename;
            const fileName = `scripts/${name}`;

            const data = await uploadFile(buffer, fileName, type);
            return response.status(200).send(data);
        } catch (error) {
            console.log(error)
            return response.status(400).send(error);
        }
    });
});



router.get("/get-apks", (req, res) => {
    var params = {
        Bucket: "pruebas-autom",
        Prefix: "apks/",
        Delimiter: "/",
        MaxKeys: 3
    };
   // console.log("ok " + process.env.AWS_ACCESS_KEY_ID + " - " + process.env.AWS_SECRET_ACCESS_KEY);
    s3.listObjects(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            return res.status(400).send(err);
        } else {
            console.log(data);
            return res.status(200).send(data);
        }
    });
});

router.get("/get-screenshots", (req, res) => {
    const {
        projectId,
        processId,
        appTechnology
    } = req.query;

    var route = appTechnology.toLowerCase() + "/" + projectId + "/process/" + processId + "/screenshots/";
    var params = {
        Bucket: "pruebas-autom",
        Prefix: route,
        MaxKeys: 3
    };
    console.log("get screenshots with params ", params)
    s3.listObjects(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            return res.status(400).send(err);
        } else {
            //console.log(data);
            return res.status(200).send(data);
        }
    });
})

router.get("/get-script-cypress", (req, res) => {
    var params = {
        Bucket: "pruebas-autom",
        Prefix: "cypress/",
        Delimiter: "/",
        MaxKeys: 3
    };
    console.log("ok " + process.env.AWS_ACCESS_KEY_ID + " - " + process.env.AWS_SECRET_ACCESS_KEY);
    s3.listObjects(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            return res.status(400).send(err);
        } else {
          //  console.log(data);
            return res.status(200).send(data);
        }
    });
});

// append /api for our http requests
app.use("/api", router);

// launch our backend into a port
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));