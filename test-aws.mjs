import { S3Client, PutBucketPolicyCommand, GetBucketPolicyCommand, PutBucketCorsCommand, GetBucketCorsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

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
    console.log("Checking bucket CORS...");
    try {
      const getCors = await client.send(new GetBucketCorsCommand({ Bucket: bucket }));
      console.log("Current CORS:", JSON.stringify(getCors.CORSRules, null, 2));
    } catch (e) {
      console.log("GetBucketCors error:", e.name, e.message);
    }
    
    console.log("Checking bucket policy...");
    try {
      const getResponse = await client.send(new GetBucketPolicyCommand({ Bucket: bucket }));
      console.log("Current Policy:", getResponse.Policy);
    } catch (e) {
      console.log("GetBucketPolicy error:", e.name, e.message);
    }
    
    console.log("Listing objects...");
    try {
      const list = await client.send(new ListObjectsV2Command({ Bucket: bucket, MaxKeys: 5 }));
      console.log("Objects:", list.Contents?.map(c => c.Key) || "No objects found");
    } catch (e) {
      console.log("ListObjects error:", e.name, e.message);
    }
  } catch (e) {
    console.error(e);
  }
}
run();
