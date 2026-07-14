import { Video, s3, BUCKET_NAME } from "@minitube/shared";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const generatePresignedUrl = async (key) => {
    if (!key) return null;
    const command = new GetObjectCommand({
        Bucket: BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME,
        Key: key,
    });
    try {
        return await getSignedUrl(s3, command, { expiresIn: 3600 }); // 1 hour expiration
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        return null;
    }
};

export const getAllVideos = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;

        const query = { status: "published" };

        const totalVideos = await Video.countDocuments(query);
        const videos = await Video.find(query)
            .select("title duration created_at thumbnail_path creatorName creatorProfilePicture views")
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Generate presigned URLs for thumbnails
        const videosWithUrls = await Promise.all(
            videos.map(async (video) => {
                const presignedThumbnailUrl = await generatePresignedUrl(
                    video.thumbnail_path,
                );

                return {
                    id: video._id,
                    title: video.title,
                    duration: video.duration,
                    created_at: video.created_at,
                    thumbnail_path:
                        presignedThumbnailUrl || video.thumbnail_path,
                    channelName: video.creatorName,
                    channelAvatar: video.creatorProfilePicture,
                    views: video.views || 0,
                    likeCount: video.likeCount || 0,
                    dislikeCount: video.dislikeCount || 0,
                };
            }),
        );

        const totalPages = Math.ceil(totalVideos / limit);

        res.json({
            videos: videosWithUrls,
            pagination: {
                currentPage: page,
                totalPages,
                totalVideos,
                hasMore: page < totalPages,
            },
        });
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json({ error: "Failed to retrieve videos" });
    }
};

// Get video links for stream
export const getVideoById = async (req, res) => {
    const { id } = req.params;

    try {
        const video = await Video.findByIdAndUpdate(
            id,
            { $inc: { views: 1 } },
            { new: true }
        ).lean();

        if (!video) {
            return res.status(404).json({ error: "Video not found" });
        }

        if (!video.hls_path || video.status !== "published") {
            return res
                .status(400)
                .json({ error: "Video is not ready for streaming" });
        }

        // Use a local proxy to bypass S3 public access restrictions
        const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
        const streamUrl = `${baseUrl}/api/videos/stream/${video._id}/master.m3u8`;
        
        let thumbnailUrl = video.thumbnail_path;
        if (thumbnailUrl) {
            const presignedThumb = await generatePresignedUrl(thumbnailUrl);
            if (presignedThumb) {
                thumbnailUrl = presignedThumb;
            }
        }

        res.json({ 
            streamUrl,
            video: {
                id: video._id,
                title: video.title,
                description: video.description,
                channelName: video.creatorName,
                channelAvatar: video.creatorProfilePicture,
                views: video.views || 0,
                created_at: video.created_at,
                thumbnail: thumbnailUrl,
                likeCount: video.likeCount || 0,
                dislikeCount: video.dislikeCount || 0,
            }
        });
    } catch (err) {
        console.error("Database error:", err);
        return res
            .status(500)
            .json({ error: "Failed to retrieve video stream" });
    }
};

// Proxy HLS chunks to bypass S3 bucket privacy
export const streamVideoProxy = async (req, res) => {
    const { id } = req.params;
    let filePath = req.params.file; // the wildcard part

    // In Express 5 / path-to-regexp v8, wildcard parameters are returned as arrays
    if (Array.isArray(filePath)) {
        filePath = filePath.join('/');
    }

    try {
        const video = await Video.findById(id).lean();

        if (!video || !video.hls_path) {
            return res.status(404).send("Video not found");
        }

        const basePath = video.hls_path.substring(0, video.hls_path.lastIndexOf('/'));
        const key = `${basePath}/${filePath}`;

        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME,
            Key: key,
        });

        const response = await s3.send(command);

        if (filePath.endsWith('.m3u8')) {
            res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        } else if (filePath.endsWith('.ts')) {
            res.setHeader('Content-Type', 'video/MP2T');
        }

        response.Body.pipe(res);
    } catch (err) {
        if (err.name === 'NoSuchKey') {
            return res.status(404).send("Segment not found");
        }
        console.error("Proxy error:", err);
        return res.status(500).send("Error fetching stream segment");
    }
};

export const getRecommendations = async (req, res) => {
    const { id } = req.params;

    try {
        const currentVideo = await Video.findById(id).lean();
        if (!currentVideo) {
            return res.status(404).json({ error: "Video not found" });
        }

        // Find videos with same category OR overlapping tags, exclude current video
        const recommendations = await Video.aggregate([
            {
                $match: {
                    _id: { $ne: id }, // Exclude current video
                    status: "published",
                    $or: [
                        { category: currentVideo.category },
                        { tags: { $in: currentVideo.tags || [] } }
                    ]
                }
            },
            { $sample: { size: 10 } } // Randomly shuffle and take 10
        ]);

        // Generate presigned URLs for thumbnails
        const recommendedVideosWithUrls = await Promise.all(
            recommendations.map(async (video) => {
                const presignedThumbnailUrl = await generatePresignedUrl(video.thumbnail_path);

                return {
                    id: video._id,
                    title: video.title,
                    duration: video.duration,
                    created_at: video.created_at,
                    thumbnail_path: presignedThumbnailUrl || video.thumbnail_path,
                    channelName: video.creatorName,
                    channelAvatar: video.creatorProfilePicture,
                    views: video.views || 0,
                };
            })
        );

        res.json({ recommendations: recommendedVideosWithUrls });
    } catch (err) {
        console.error("Error fetching recommendations:", err);
        res.status(500).json({ error: "Failed to retrieve recommendations" });
    }
};
