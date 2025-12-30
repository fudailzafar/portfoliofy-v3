import { pdfToText } from 'pdf-ts';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.S3_UPLOAD_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.S3_UPLOAD_KEY || '',
    secretAccessKey: process.env.S3_UPLOAD_SECRET || '',
  },
});

export async function scrapePdfContent(pdfUrl: string) {
  try {
    // Extract bucket and key from S3 URL
    const url = new URL(pdfUrl);
    const bucket = url.hostname.split('.')[0];
    const key = decodeURIComponent(url.pathname.slice(1));

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    const response = await s3Client.send(command);
    const arrayBuffer = await response.Body?.transformToByteArray();

    if (!arrayBuffer) {
      throw new Error('Failed to read PDF content');
    }

    const buffer = Buffer.from(arrayBuffer);
    const text = await pdfToText(buffer);
    return text;
  } catch (error) {
    console.error('Error scraping PDF content:', error);
    throw error;
  }
}
