import ffmpeg from "fluent-ffmpeg";
import { ApiError as AppError } from "@minitube/shared";

export const getMetadata = (filePath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err)
                return reject(
                    new AppError(500, `FFprobe Error: ${err.message}`),
                );

            const videoStream = metadata.streams.find(
                (s) => s.codec_type === "video",
            );
            if (!videoStream) {
                return reject(
                    new AppError(400, "No video stream found in the file."),
                );
            }

            // Verify 16:9 aspect ratio (with a small tolerance for rounding differences)
            const aspectRatio = videoStream.width / videoStream.height;
            if (Math.abs(aspectRatio - 16 / 9) > 0.05) {
                return reject(
                    new AppError(
                        400,
                        `Only 16:9 videos are supported. Provided aspect ratio is roughly ${aspectRatio.toFixed(2)}:1.`,
                    ),
                );
            }

            const rawDuration = metadata.format?.duration
                ? metadata.format.duration
                : videoStream?.duration
                  ? videoStream.duration
                  : 0;

            resolve({
                duration: Math.round(rawDuration),
                width: videoStream.width,
                height: videoStream.height,
            });
        });
    });
};
