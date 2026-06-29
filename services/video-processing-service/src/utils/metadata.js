import ffmpeg from "fluent-ffmpeg";
import { ApiError as AppError } from "@minitube/shared";

export const getMetadata = (filePath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) return reject(new AppError(`FFprobe Error: ${err.message}`, 500));

            const videoStream = metadata.streams.find(
                (s) => s.codec_type === "video",
            );
            if (!videoStream) {
                return reject(new AppError("No video stream found in the file.", 400));
            }

            resolve({
                duration: Math.round(metadata.format.duration),
                width: videoStream.width,
                height: videoStream.height,
            });
        });
    });
};
