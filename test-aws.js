require('dotenv').config({ path: '.env.local' });
const { S3Client, PutBucketPolicyCommand, GetBucketPolicyCommand } = require('@aws-sdk/client-s3');

const client = new S3Client({
  region: process.env.S3_UPLOAD_REGION,
  credentials: {
    accessKeyId: process.env.S3_UPLOAD_KEY,
    secretAccessKey: process.env.S3_UPLOAD_SECRET,
  },
});

async function run() {
  try {
    const bucket = process.env.S3_UPLOAD_BUCKET;
    console.log("Checking bucket policy...");
    try {
      const getResponse = await client.send(new GetBucketPolicyCommand({ Bucket: bucket }));
      console.log("Current Policy:", getResponse.Policy);
    } catch (e) {
      console.log("GetBucketPolicy error:", e.name, e.message);
    }
  } catch (e) {
    console.error(e);
  }
}
run();
