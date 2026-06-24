import db from '../config/database.js';
import path from 'path';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3 } from '../middlewares/upload.js';

const generatePresignedUrl = async (key) => {
  if (!key) return null;
  const command = new GetObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: key,
  });
  try {
    return await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour expiration
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return null;
  }
};

export const uploadVideo = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file provided' });
  }

  const { originalname, key, mimetype, size } = req.file;
  
  const filename = path.basename(key);
  const id = path.parse(filename).name;

  try {
    const video = await db.video.create({
      data: {
        id,
        original_name: originalname,
        saved_name: filename,
        mime_type: mimetype,
        size,
        upload_path: key
      }
    });

    res.status(201).json({
      message: 'Video uploaded successfully',
      video
    });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Failed to save video metadata' });
  }
};

export const getAllVideos = async (req, res) => {
  try {
    const videos = await db.video.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });
    res.json(videos);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Failed to retrieve videos' });
  }
};

export const getVideoById = async (req, res) => {
  const { id } = req.params;
  
  try {
    const video = await db.video.findUnique({
      where: { id }
    });
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    const presignedUrl = await generatePresignedUrl(video.upload_path);
    video.upload_path = presignedUrl; // Return the presigned URL instead of the S3 key
    res.json(video);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Failed to retrieve video metadata' });
  }
};
