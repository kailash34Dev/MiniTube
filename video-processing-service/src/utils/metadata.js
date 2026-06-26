import ffmpeg from 'fluent-ffmpeg';

export const getMetadata = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) return reject(err);
      
      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      if (!videoStream) {
        return reject(new Error('No video stream found in the file.'));
      }
      
      resolve({
        duration: Math.round(metadata.format.duration),
        width: videoStream.width,
        height: videoStream.height,
      });
    });
  });
};
