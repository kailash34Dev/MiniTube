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

export const uploadVideo = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file provided' });
  }

  const { originalname, key, mimetype, size } = req.file;
  
  const filename = path.basename(key);
  const id = path.parse(filename).name;

  const query = `INSERT INTO videos (id, original_name, saved_name, mime_type, size, upload_path) VALUES (?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [id, originalname, filename, mimetype, size, key], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to save video metadata' });
    }
    
    res.status(201).json({
      message: 'Video uploaded successfully',
      video: {
        id,
        original_name: originalname,
        saved_name: filename,
        mime_type: mimetype,
        size,
        upload_path: key
      }
    });
  });
};

export const getAllVideos = (req, res) => {
  const query = `SELECT * FROM videos ORDER BY created_at DESC`;
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to retrieve videos' });
    }
    res.json(rows);
  });
};

export const getVideoById = (req, res) => {
  const { id } = req.params;
  const query = `SELECT * FROM videos WHERE id = ?`;
  
  db.get(query, [id], async (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Failed to retrieve video metadata' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    const presignedUrl = await generatePresignedUrl(row.upload_path);
    row.upload_path = presignedUrl; // Return the presigned URL instead of the S3 key
    res.json(row);
  });
};
