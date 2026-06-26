import db from '../config/database.js';
import path from 'path';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { SendMessageCommand } from '@aws-sdk/client-sqs';
import { s3 } from '../middlewares/upload.js';
import sqsClient, { QUEUE_URL } from '../config/sqs.js';
import { nanoid } from 'nanoid';

const generatePresignedUploadUrl = async (key, contentType) => {
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

export const uploadInit = async (req, res) => {
  const {
    title,
    description,
    category,
    tags,
    fileName,
    mimeType,
    size,
    thumbnailFileName,
    thumbnailMimeType,
  } = req.body;

  if (!fileName || !mimeType) {
    return res.status(400).json({ error: 'Video file metadata is required' });
  }

  try {
    const videoId = nanoid(10);
    const videoExt = path.extname(fileName);
    const videoKey = `videos/raw/${videoId}${videoExt}`;
    
    let thumbnailKey = null;
    let thumbnailUploadUrl = null;

    if (thumbnailFileName && thumbnailMimeType) {
      const thumbExt = path.extname(thumbnailFileName);
      thumbnailKey = `videos/thumbnails/${videoId}${thumbExt}`;
      thumbnailUploadUrl = await generatePresignedUploadUrl(thumbnailKey, thumbnailMimeType);
    }

    const videoUploadUrl = await generatePresignedUploadUrl(videoKey, mimeType);

    if (!videoUploadUrl) {
       return res.status(500).json({ error: 'Failed to generate upload URLs' });
    }

    const newVideo = await db.video.create({
      data: {
        id: videoId,
        original_name: fileName,
        saved_name: `${videoId}${videoExt}`,
        mime_type: mimeType,
        actual_size: size,
        title: title || '',
        description: description || '',
        category: category || '',
        tags: tags || [],
        thumbnail_path: thumbnailKey || '',
        upload_path: videoKey,
        status: 'UPLOADING',
      }
    });

    res.status(200).json({
      videoId,
      uploadUrl: videoUploadUrl,
      uploadPath: videoKey,
      thumbnailUploadUrl,
      thumbnailPath: thumbnailKey,
    });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Failed to initialize upload' });
  }
};

export const uploadComplete = async (req, res) => {
  const { videoId } = req.body;

  if (!videoId) {
    return res.status(400).json({ error: 'Video ID is required' });
  }

  try {
    const video = await db.video.findUnique({
      where: { id: videoId },
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    await db.video.update({
      where: { id: videoId },
      data: { status: 'PROCESSING' },
    });
    
    // Notify SQS that a video is ready for processing
    const sqsPayload = { videoId };
    const sendCommand = new SendMessageCommand({
      QueueUrl: QUEUE_URL,
      MessageBody: JSON.stringify(sqsPayload),
    });
    await sqsClient.send(sendCommand);

    res.status(200).json({
      success: true,
      message: 'Video uploaded successfully and queued for processing.',
    });
  } catch (err) {
    console.error('Database or SQS error:', err);
    return res.status(500).json({ error: 'Failed to complete upload' });
  }
};
