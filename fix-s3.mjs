import { S3Client, PutBucketPolicyCommand, PutPublicAccessBlockCommand } from '@aws-sdk/client-s3';

const client = new S3Client({
  region: process.env.S3_UPLOAD_REGION,
  credentials: {
    accessKeyId: process.env.S3_UPLOAD_KEY,
    secretAccessKey: process.env.S3_UPLOAD_SECRET,
  },
});

async function run() {
  const bucket = process.env.S3_UPLOAD_BUCKET;
  
  console.log("Removing public access block...");
  try {
    await client.send(new PutPublicAccessBlockCommand({
      Bucket: bucket,
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: false,
        IgnorePublicAcls: false,
        BlockPublicPolicy: false,
        RestrictPublicBuckets: false,
      },
    }));
    console.log("Successfully removed public access block.");
  } catch (e) {
    console.log("Failed to remove public access block:", e.name, e.message);
  }

  console.log("Applying public read bucket policy...");
  try {
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Sid: "PublicReadGetObject",
          Effect: "Allow",
          Principal: "*",
          Action: "s3:GetObject",
          Resource: `arn:aws:s3:::${bucket}/*`,
        },
      ],
    };
    await client.send(new PutBucketPolicyCommand({
      Bucket: bucket,
      Policy: JSON.stringify(policy),
    }));
    console.log("Successfully applied bucket policy.");
  } catch (e) {
    console.log("Failed to apply bucket policy:", e.name, e.message);
  }
}
run();
