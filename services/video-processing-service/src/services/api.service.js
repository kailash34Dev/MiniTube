import { ApiError as AppError } from "@minitube/shared";

const getUploadServiceUrl = () => {
    return process.env.UPLOAD_SERVICE_URL;
};

export const checkUploadServiceHealth = async () => {
    try {
        // We just need to check if the upload server is accepting connections.
        // This is required before starting video processing.
        // It might return 404, but as long as it doesn't throw ECONNREFUSED, it's up.
        const url = getUploadServiceUrl().replace("/api/internal", "");
        await fetch(url, { method: "HEAD" });
        return true;
    } catch (error) {
        return false;
    }
};

export const fetchVideoDetails = async (videoId) => {
    const url = `${getUploadServiceUrl()}/videos/${videoId}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new AppError(
            response.status,
            `Failed to fetch video ${videoId}. Status: ${response.status}`,
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
            response.status,
            `Failed to update video ${videoId} status. Status: ${response.status}`,
        );
    }

    const data = await response.json();
    return data.video;
};
