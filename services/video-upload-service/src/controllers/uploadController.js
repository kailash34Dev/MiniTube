import path from "path";
import { nanoid } from "nanoid";
import { generatePresignedUploadUrl } from "../services/s3Service.js";
import {
    createVideo,
    getVideoById,
    updateVideoStatus,
} from "../services/videoService.js";
import { queueVideoForProcessing } from "../services/sqsService.js";
import { ApiError, asyncHandler } from "@minitube/shared";

export const uploadInit = asyncHandler(async (req, res) => {
    const {
        title,
        description,
        category,
        tags,
        fileName,
        mimeType,
        size,
        thumbnailFileName,
        thumbnailMimeType,
    } = req.body;

    if (!fileName || !mimeType || !thumbnailFileName || !thumbnailMimeType) {
        throw new ApiError(
            400,
            "Video and thumbnail file metadata are required",
        );
    }

    if (!title || !description || !category) {
        throw new ApiError(
            400,
            "title, description, and category are required",
        );
    }

    const videoId = nanoid(10);
    const videoExt = path.extname(fileName);
    const videoKey = `videos/raw/${videoId}${videoExt}`;

    let thumbnailKey = null;
    let thumbnailUploadUrl = null;

    if (thumbnailFileName && thumbnailMimeType) {
        const thumbExt = path.extname(thumbnailFileName);
        thumbnailKey = `videos/thumbnails/${videoId}${thumbExt}`;
        thumbnailUploadUrl = await generatePresignedUploadUrl(
            thumbnailKey,
            thumbnailMimeType,
        );
        
        if (!thumbnailUploadUrl) {
            throw new ApiError(500, "Failed to generate thumbnail upload URL");
        }
    }

    const videoUploadUrl = await generatePresignedUploadUrl(videoKey, mimeType);

    if (!videoUploadUrl) {
        throw new ApiError(500, "Failed to generate upload URLs");
    }

    await createVideo({
        id: videoId,
        mime_type: mimeType,
        actual_size: size,
        title: title,
        description: description,
        category: category,
        tags: tags || [],
        thumbnail_path: thumbnailKey || "",
        upload_path: videoKey,
        status: "uploading",
    });

    res.status(200).json({
        videoId,
        uploadUrl: videoUploadUrl,
        thumbnailUploadUrl,
    });
});

export const uploadComplete = asyncHandler(async (req, res) => {
    const { videoId } = req.body;

    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    const video = await getVideoById(videoId);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    await updateVideoStatus(videoId, "processing");
    await queueVideoForProcessing(videoId);

    res.status(200).json({
        success: true,
        message: "Video uploaded successfully and queued for processing.",
    });
});
