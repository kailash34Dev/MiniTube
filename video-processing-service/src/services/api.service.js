import { AppError } from "../utils/AppError.js";

const getUploadServiceUrl = () => {
    return (
        process.env.UPLOAD_SERVICE_URL || "http://localhost:5001/api/internal"
    );
};

export const fetchVideoDetails = async (videoId) => {
    const url = `${getUploadServiceUrl()}/videos/${videoId}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new AppError(
            `Failed to fetch video ${videoId}. Status: ${response.status}`,
            response.status,
        );
    }

    const data = await response.json();
    return data.video;
};

export const updateVideoStatus = async (videoId, updateData) => {
    const url = `${getUploadServiceUrl()}/videos/${videoId}`;
    const response = await fetch(url, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
    });

    if (!response.ok) {
        throw new AppError(
            `Failed to update video ${videoId} status. Status: ${response.status}`,
            response.status,
        );
    }

    const data = await response.json();
    return data.video;
};
