const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

exports.uploadToS3 = async (file) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `uploads/${Date.now()}-${file.originalname}`,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };

  return s3.upload(params).promise();
};

exports.deleteFromS3 = async (key) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key
  };

  return s3.deleteObject(params).promise();
};