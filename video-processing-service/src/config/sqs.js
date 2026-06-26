import { SQSClient } from '@aws-sdk/client-sqs';

// Initialize SQSClient without explicit credentials to use the default credential provider chain (EC2 IAM Role)
const sqs = new SQSClient({
  region: process.env.AWS_REGION,
});

export const QUEUE_URL = process.env.SQS_QUEUE_URL;

export default sqs;
