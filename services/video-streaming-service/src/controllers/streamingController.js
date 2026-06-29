import { Video, s3, BUCKET_NAME } from '@minitube/shared';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const generatePresignedUrl = async (key) => {
  if (!key) return null;
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME,
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
    const videos = await Video.find().sort({ created_at: -1 }).lean();
    
    // Generate presigned URLs for thumbnails
    const videosWithUrls = await Promise.all(videos.map(async (video) => {
      const presignedThumbnailUrl = await generatePresignedUrl(video.thumbnail_path);
      
      let publicHlsPath = video.hls_path;
      if (video.hls_path && video.status === 'published') {
        const bucketName = BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME;
        publicHlsPath = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${video.hls_path}`;
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
    const video = await Video.findById(id).lean();
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    const presignedUrl = await generatePresignedUrl(video.upload_path);
    const presignedThumbnailUrl = await generatePresignedUrl(video.thumbnail_path);
    
    video.upload_path = presignedUrl;
    video.thumbnail_path = presignedThumbnailUrl;
    
    if (video.hls_path && video.status === 'published') {
      const bucketName = BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME;
      video.hls_path = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${video.hls_path}`;
    }
    
    res.json(video);
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ error: 'Failed to retrieve video metadata' });
  }
};
