import fs from "fs";
import path from "path";
import { downloadFile, uploadFile, getAllFiles } from "./s3.service.js";
import { getMetadata } from "../utils/metadata.js";
import { generateHlsStream, QUALITIES } from "./ffmpeg.service.js";
import { updateVideoStatus } from "./api.service.js";
import { AppError } from "../utils/AppError.js";

const TEMP_DIR = "/tmp";

const generateAllQualities = async (rawLocalPath, hlsLocalDir, metadata) => {
    const targetQualities = QUALITIES.filter(
        (q) => q.resolution <= metadata.height,
    );
    if (targetQualities.length === 0) {
        targetQualities.push(QUALITIES.find((q) => q.name === "360p"));
    }

    const playlistEntries = ["#EXTM3U"];

    for (const quality of targetQualities) {
        console.log(`[Worker] Generating ${quality.name} stream...`);
        const streamDir = path.join(hlsLocalDir, quality.name);
        await generateHlsStream(rawLocalPath, streamDir, quality);

        const bandwidth = quality.bitrate * 1024;
        playlistEntries.push(
            `#EXT-X-STREAM-INF:BANDWIDTH=${bandwidth},RESOLUTION=${quality.resolutionStr}`,
        );
        playlistEntries.push(`${quality.name}/index.m3u8`);
    }

    return playlistEntries;
};

const generateMasterPlaylist = (hlsLocalDir, playlistEntries) => {
    console.log(`[Worker] Generating master playlist...`);
    const masterPlaylistContent = playlistEntries.join("\n");
    const masterPlaylistPath = path.join(hlsLocalDir, "master.m3u8");
    fs.writeFileSync(masterPlaylistPath, masterPlaylistContent);
    return masterPlaylistPath;
};

const uploadProcessedFiles = async (hlsLocalDir, videoId) => {
    console.log(`[Worker] Uploading HLS files to S3...`);
    const allFiles = getAllFiles(hlsLocalDir);
    let totalProcessedSize = 0;

    for (const file of allFiles) {
        const relativePath = path.relative(hlsLocalDir, file);
        const s3Key = `videos/hls/${videoId}/${relativePath}`;

        const stat = fs.statSync(file);
        totalProcessedSize += stat.size;

        await uploadFile(file, s3Key);
    }

    return totalProcessedSize;
};

const cleanupTempFiles = (rawLocalPath, hlsLocalDir) => {
    console.log(`[Worker] Cleaning up temporary files...`);
    if (fs.existsSync(rawLocalPath)) fs.unlinkSync(rawLocalPath);
    if (fs.existsSync(hlsLocalDir))
        fs.rmSync(hlsLocalDir, { recursive: true, force: true });
};

export const processVideo = async (video) => {
    console.log(`\n[Worker] Processing video: ${video.id}`);
    const rawLocalPath = path.join(
        TEMP_DIR,
        `${video.id}${path.extname(video.upload_path)}`,
    );
    const hlsLocalDir = path.join(TEMP_DIR, "hls", video.id);

    try {
        // 1. Download Raw Video
        console.log(`[Worker] Downloading from S3: ${video.upload_path}`);
        await downloadFile(video.upload_path, rawLocalPath);

        // 2. Extract Metadata
        console.log(`[Worker] Extracting metadata...`);
        const metadata = await getMetadata(rawLocalPath);
        console.log(
            `[Worker] Metadata: Duration ${metadata.duration}s, Res ${metadata.width}x${metadata.height}`,
        );

        // 3. Generate HLS Streams
        console.log(`[Worker] Generating HLS streams...`);
        const playlistEntries = await generateAllQualities(
            rawLocalPath,
            hlsLocalDir,
            metadata,
        );

        // 4. Generate Master Playlist
        generateMasterPlaylist(hlsLocalDir, playlistEntries);

        // 5. Upload HLS Files
        const totalProcessedSize = await uploadProcessedFiles(
            hlsLocalDir,
            video.id,
        );

        // 6. Update via API
        console.log(`[Worker] Updating status to published...`);
        await updateVideoStatus(video.id, {
            duration: metadata.duration,
            width: metadata.width,
            height: metadata.height,
            hls_path: `videos/hls/${video.id}/master.m3u8`,
            processed_size: totalProcessedSize,
            status: "published",
        });

        console.log(`[Worker] Video ${video.id} processing complete!`);
    } catch (error) {
        console.error(`[Worker] Error processing video ${video.id}:`, error);

        // Rethrow the error. If it's not an AppError, wrap it.
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError(`Processing failed: ${error.message}`, 500, false);
    } finally {
        cleanupTempFiles(rawLocalPath, hlsLocalDir);
    }
};
