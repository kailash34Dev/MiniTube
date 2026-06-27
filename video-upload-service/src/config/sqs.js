import { SQSClient } from "@aws-sdk/client-sqs";

const sqs = new SQSClient({
    region: process.env.AWS_REGION,
});

export const QUEUE_URL = process.env.SQS_QUEUE_URL;

export default sqs;
