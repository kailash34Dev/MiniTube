import db from '../config/database.js';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

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

export const getAllVideos = async (req, res) => {
  try {
    const videos = await db.video.findMany({
      orderBy: {
        created_at: 'desc'
      }
    });
    
    // Generate presigned URLs for thumbnails
    const videosWithUrls = await Promise.all(videos.map(async (video) => {
      const presignedThumbnailUrl = await generatePresignedUrl(video.thumbnail_path);
      
      let publicHlsPath = video.hls_path;
      if (video.hls_path && video.status === 'READY') {
        publicHlsPath = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${video.hls_path}`;
      }

      return {
        ...video,
        thumbnail_path: presignedThumbnailUrl || video.thumbnail_path,
        hls_path: publicHlsPath
      };
    }));

    res.json(videosWithUrls);
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
    const presignedThumbnailUrl = await generatePresignedUrl(video.thumbnail_path);
    
    video.upload_path = presignedUrl;
    video.thumbnail_path = presignedThumbnailUrl;
    
    if (video.hls_path && video.status === 'READY') {
      video.hls_path = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${video.hls_path}`;
    }
    
    res.json(video);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Failed to retrieve video metadata' });
  }
};
