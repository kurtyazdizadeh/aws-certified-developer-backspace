require('dotenv/config');
const AWS = require('aws-sdk');
const fs = require('fs').promises;

const { 
  AWS_PROFILE, 
  BUCKET_NAME,
  REGION
} = process.env;

var credentials = new AWS.SharedIniFileCredentials({ profile: AWS_PROFILE });
AWS.config.credentials = credentials;
AWS.config.update({ region: REGION });

const ddb = new AWS.DynamoDB();
const s3 = new AWS.S3();

(async function() {
  try {
    const tables = await ddb.listTables().promise();
    console.log(tables.TableNames);

    await createS3Bucket();
    await putJSONinS3();
  } 
  catch (err) {
    console.log(err, err.stack);
  };
})();

async function createS3Bucket() {
  try {
    let params = {
      Bucket: BUCKET_NAME
    };
    const newBucket = await s3.createBucket(params).promise();
    console.log(`Bucket ${BUCKET_NAME} created in ${newBucket.Location}`);
  }
  catch(err) {
    console.log(err, err.stack)
  };
}

async function putJSONinS3() {
  try{
    let data = await fs.readFile('test-table-items.json', 'utf8');

    let params = {
      Body: data,
      Bucket: BUCKET_NAME,
      Key: 'lab-data/test-table-items.json',
    }
    const response = await s3.putObject(params).promise();
    console.log(`JSON file uploaded to S3, ETag: ${response.ETag}`);
  } 
  catch (err) {
    console.log (err, err.stack);
  }
}