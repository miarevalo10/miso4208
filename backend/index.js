const express = require("express");

const API_PORT = 3001;
const app = express();
const router = express.Router();

var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });
var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

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
    var params = {
        DelaySeconds: 0,
        MessageBody: "Test to run",
        QueueUrl: process.env.SQS_CYPRESS
    };

    sqs.sendMessage(params, function (err, data) {
        if (err) {
            res.json({ success: false, error: err }); ("Error", err);
        } else {
            return res.json({ success: true });
        }
    });
});



// append /api for our http requests
app.use("/api", router);

// launch our backend into a port
app.listen(API_PORT, () => console.log(`LISTENING ON PORT ${API_PORT}`));