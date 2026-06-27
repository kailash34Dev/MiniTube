import Video from "../models/video.model.js";

export const createVideo = async (videoData) => {
    try {
        if (videoData.id) {
            videoData._id = videoData.id;
            delete videoData.id;
        }
        const newVideo = new Video(videoData);
        return await newVideo.save();
    } catch (err) {
        console.error("Database error in createVideo:", err);
        throw err;
    }
};

export const getVideoById = async (videoId) => {
    try {
        return await Video.findById(videoId);
    } catch (err) {
        console.error("Database error in getVideoById:", err);
        throw err;
    }
};

export const updateVideoStatus = async (videoId, status) => {
    try {
        return await Video.findByIdAndUpdate(
            videoId,
            { status },
            { new: true },
        );
    } catch (err) {
        console.error("Database error in updateVideoStatus:", err);
        throw err;
    }
};
