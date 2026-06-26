import { S3Client } from '@aws-sdk/client-s3';

// Initialize S3Client without explicit credentials to use the default credential provider chain (EC2 IAM Role)
const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

export const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

export default s3;
