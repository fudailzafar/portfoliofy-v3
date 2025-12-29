import AWS from 'aws-sdk';

AWS.config.update({
  region: process.env.S3_UPLOAD_REGION!!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!!,
  },
});

export const deleteS3File = async ({
  bucket,
  key,
}: {
  bucket: string;
  key: string;
}) => {
  const s3 = new AWS.S3();
  const bucketName = process.env.S3_BUCKET_NAME;

  const params = { Bucket: bucket, Key: key };

  console.log(`Deleting file ${key} from S3.`);

  await s3.deleteObject(params).promise();

  console.log(`File ${key} deleted from S3.`);

  return { success: true };
};
