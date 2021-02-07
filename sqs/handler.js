require('dotenv/config');
const AWS = require('aws-sdk');

const { AWS_PROFILE, REGION } = process.env;

var credentials = new AWS.SharedIniFileCredentials({ profile: AWS_PROFILE });
AWS.config.credentials = credentials;
AWS.config.update({ region: REGION });

const sqs = new AWS.SQS();
const sns = new AWS.SNS();

let queueUrl;
let waitingSQS = false;
let queueCounter = 0;
const params = {
  QueueName: 'backspace-lab',
  Attributes: {
    ReceiveMessageWaitTimeSeconds: '20',
    VisibilityTimeout: '60'
  }
};

sqs.createQueue(params, (err, data) => {
  if (err) console.log(err, err.stack);
  else {
    console.log(`Successfully created SQS queue URL: ${data.QueueUrl}`);
    queueUrl = data.QueueUrl;
    waitingSQS = false;
    createMessages(queueUrl);
  }
});

setInterval(() => {
  if (!waitingSQS) {
    if (queueCounter <= 0) {
      receiveMessages();
    } 
    else --queueCounter;
  }
}, 1000);

function receiveMessages() {
  let params = {
    QueueUrl: queueUrl,
    MaxNumberOfMessages: 10,
    VisibilityTimeout: 60,
    WaitTimeSeconds: 20
  };
  waitingSQS = true;
  sqs.receiveMessage(params, (err,data) => {
    if (err) {
      console.log(err, err.stack)
      waitingSQS = false;
    }
    else {
      waitingSQS = false;
      if ((typeof data.Messages !== 'undefined') && (data.Messages.length !== 0)) {
        console.log(`Received ${data.Messages.length} messages from SQS qeueue.`);
        processMessages(data.Messages);
      } else {
        queueCounter = 60,
        console.log(`SQS queue empty, waiting for ${queueCounter} s.`)
      }
    }
  });
}

function createMessages(queueUrl) {
  const message = 'This is a message from Amazon SNS.';
  console.log(`Sending message: ${message}`);
  sns.publish({
    Message: message,
    TargetArn: 'arn:aws:sns:us-east-1:962194106498:backspace-lab'
  }, (err, data) => {
    if (err) console.log(err, err.stack);
    else console.log(`Message sent by SNS: ${data.MessageId}`);
  });
}

async function processMessages(messagesSQS) {
  for (const item of messagesSQS) {
    await console.log(`Processing message: ${item.Body}`);
    let params = {
      QueueUrl: queueUrl,
      ReceiptHandle: item.ReceiptHandle
    };
    await sqs.deleteMessage(params, (err, data) => {
      if (err) console.log(err, err.stack);
      else {
        console.log(`Deleted message - RequestID: ${JSON.stringify(data.ResponseMetadata.RequestId)}`);
      }
    })
  }
}