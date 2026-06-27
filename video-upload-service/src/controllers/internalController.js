import { getVideoById, updateVideo } from "../services/videoService.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getInternalVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const video = await getVideoById(id);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    res.status(200).json({
        success: true,
        video,
    });
});

export const updateInternalVideo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const video = await updateVideo(id, updateData);

    if (!video) {
        throw new ApiError(404, "Video not found");
    }

    res.status(200).json({
        success: true,
        video,
    });
});
