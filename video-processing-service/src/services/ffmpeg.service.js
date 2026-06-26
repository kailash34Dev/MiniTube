import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import path from 'path';

export const QUALITIES = [
  { resolution: 1080, bitrate: 5000, name: '1080p' },
  { resolution: 720, bitrate: 2800, name: '720p' },
  { resolution: 540, bitrate: 1400, name: '540p' },
  { resolution: 360, bitrate: 800, name: '360p' },
];

export const generateHlsStream = (inputPath, outputDir, quality) => {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(outputDir, { recursive: true });
    
    ffmpeg(inputPath)
      .outputOptions([
        `-vf scale=w=-2:h=${quality.resolution}`,
        `-b:v ${quality.bitrate}k`,
        `-maxrate ${quality.bitrate * 1.2}k`,
        `-bufsize ${quality.bitrate * 2}k`,
        `-c:v libx264`,
        `-c:a aac`,
        `-b:a 128k`,
        `-hls_time 10`,
        `-hls_playlist_type vod`,
        `-hls_segment_filename ${outputDir}/segment_%03d.ts`
      ])
      .output(`${outputDir}/index.m3u8`)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
};
