import fs from 'fs';
import path from 'path';
import db from '../config/database.js';
import { downloadFile, uploadFile, getAllFiles } from './s3.service.js';
import { getMetadata } from '../utils/metadata.js';
import { generateHlsStream, QUALITIES } from './ffmpeg.service.js';

const TEMP_DIR = '/tmp';

export const processVideo = async (video) => {
  console.log(`\n[Worker] Processing video: ${video.id}`);
  const rawLocalPath = path.join(TEMP_DIR, `${video.id}${path.extname(video.upload_path)}`);
  const hlsLocalDir = path.join(TEMP_DIR, 'hls', video.id);
  
  try {
    // Download Raw Video
    console.log(`[Worker] Downloading from S3: ${video.upload_path}`);
    await downloadFile(video.upload_path, rawLocalPath);

    // Extract Metadata
    console.log(`[Worker] Extracting metadata...`);
    const metadata = await getMetadata(rawLocalPath);
    console.log(`[Worker] Metadata: Duration ${metadata.duration}s, Res ${metadata.width}x${metadata.height}`);

    // Generate HLS Streams
    console.log(`[Worker] Generating HLS streams...`);
    const targetQualities = QUALITIES.filter(q => q.resolution <= metadata.height);
    if (targetQualities.length === 0) {
      targetQualities.push(QUALITIES.find(q => q.name === '360p'));
    }

    const playlistEntries = ['#EXTM3U'];
    
    for (const quality of targetQualities) {
      console.log(`[Worker] Generating ${quality.name} stream...`);
      const streamDir = path.join(hlsLocalDir, quality.name);
      await generateHlsStream(rawLocalPath, streamDir, quality);
      
      const bandwidth = quality.bitrate * 1024;
      playlistEntries.push(`#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${quality.resolution === 1080 ? '1920x1080' : quality.resolution === 720 ? '1280x720' : quality.resolution === 540 ? '960x540' : '640x360'}`);
      playlistEntries.push(`${quality.name}/index.m3u8`);
    }

    // Generate Master Playlist
    console.log(`[Worker] Generating master playlist...`);
    const masterPlaylistContent = playlistEntries.join('\n');
    const masterPlaylistPath = path.join(hlsLocalDir, 'master.m3u8');
    fs.writeFileSync(masterPlaylistPath, masterPlaylistContent);

    // Upload HLS Files
    console.log(`[Worker] Uploading HLS files to S3...`);
    const allFiles = getAllFiles(hlsLocalDir);
    let totalProcessedSize = 0;
    
    for (const file of allFiles) {
      const relativePath = path.relative(hlsLocalDir, file);
      const s3Key = `videos/hls/${video.id}/${relativePath}`;
      
      const stat = fs.statSync(file);
      totalProcessedSize += stat.size;
      
      await uploadFile(file, s3Key);
    }

    // Update Database
    console.log(`[Worker] Updating database to READY...`);
    await db.video.update({
      where: { id: video.id },
      data: {
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height,
        hls_path: `videos/hls/${video.id}/master.m3u8`,
        processed_size: totalProcessedSize,
        status: 'READY',
      }
    });

    console.log(`[Worker] Video ${video.id} processing complete!`);
  } catch (error) {
    console.error(`[Worker] Error processing video ${video.id}:`, error);
    
    console.log(`[Worker] Updating database to FAILED...`);
    try {
      await db.video.update({
        where: { id: video.id },
        data: {
          status: 'FAILED',
          error_message: error.message || 'Unknown processing error',
        }
      });
    } catch (dbError) {
      console.error(`[Worker] Failed to update database status:`, dbError);
    }
    
    // Rethrow to prevent SQS deletion
    throw error;
  } finally {
    // Cleanup
    console.log(`[Worker] Cleaning up temporary files...`);
    if (fs.existsSync(rawLocalPath)) fs.unlinkSync(rawLocalPath);
    if (fs.existsSync(hlsLocalDir)) fs.rmSync(hlsLocalDir, { recursive: true, force: true });
  }
};
