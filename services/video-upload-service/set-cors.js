import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

const corsParams = {
  Bucket: process.env.AWS_S3_BUCKET_NAME,
  CORSConfiguration: {
    CORSRules: [
      {
        AllowedHeaders: ["*"],
        AllowedMethods: ["PUT", "POST", "GET", "HEAD", "DELETE"],
        AllowedOrigins: ["*"], // You can restrict this to http://localhost:5173 for security later
        ExposeHeaders: ["ETag"],
        MaxAgeSeconds: 3000,
      },
    ],
  },
};

const run = async () => {
  try {
    const data = await s3Client.send(new PutBucketCorsCommand(corsParams));
    console.log("CORS configuration applied successfully.", data);
  } catch (err) {
    console.error("Error applying CORS configuration:", err);
  }
};

run();
