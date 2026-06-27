import fs from "fs";
import path from "path";
import mime from "mime-types";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { pipeline } from "stream/promises";
import s3Client, { BUCKET_NAME } from "../config/s3.js";

export const downloadFile = async (s3Key, localDestPath) => {
    const getCmd = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: s3Key });
    const s3Response = await s3Client.send(getCmd);

    const writeStream = fs.createWriteStream(localDestPath);
    await pipeline(s3Response.Body, writeStream);
};

export const uploadFile = async (localFilePath, s3Key) => {
    const fileStream = fs.createReadStream(localFilePath);
    const mimeType = mime.lookup(localFilePath) || "application/octet-stream";

    await s3Client.send(
        new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key,
            Body: fileStream,
            ContentType: mimeType,
        }),
    );
};

export const getAllFiles = (dirPath, arrayOfFiles) => {
    const files = fs.readdirSync(dirPath);
    let allFiles = arrayOfFiles || [];

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            allFiles = getAllFiles(fullPath, allFiles);
        } else {
            allFiles.push(fullPath);
        }
    });

    return allFiles;
};
