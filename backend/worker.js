var AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });
var sqs = new AWS.SQS({ apiVersion: '2012-11-05' });

var params = {
  QueueUrl: process.env.SQS_CYPRESS
};

var rcvMsg = function rcvMsg() {
  sqs.receiveMessage(params, function (err, data) {
    if (err) console.log(err, err.stack); 
    else console.log(data);           
  });
}

var t = setInterval(rcvMsg, 2000);
