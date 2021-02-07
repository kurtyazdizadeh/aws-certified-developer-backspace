require('dotenv/config');

const { AWS_PROFILE } = process.env

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

var credentials = new AWS.SharedIniFileCredentials({ profile: AWS_PROFILE });
AWS.config.credentials = credentials;


(async () => {
  try {
    const data = await s3.listBuckets().promise();

    console.log(`S3 buckets in your ${AWS_PROFILE} account:`);
    data.Buckets.forEach(bucket => console.log(bucket.Name));
  } catch(err) {
    console.log(err)
  }
})();
