import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../config/s3.js";

export const generatePresignedUploadUrl = async (key, contentType) => {
    if (!key) return null;
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        ContentType: contentType,
    });
    try {
        return await getSignedUrl(s3, command, { expiresIn: 3600 });
    } catch (error) {
        console.error("Error generating presigned upload URL:", error);
        return null;
    }
};
