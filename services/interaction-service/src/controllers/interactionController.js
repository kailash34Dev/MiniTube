import { Interaction, Video } from "@minitube/shared";

export const toggleInteraction = async (req, res) => {
    const { videoId } = req.params;
    const { type } = req.body; // 'like' or 'dislike'
    const userId = req.user.id; // From verifyToken middleware

    if (!['like', 'dislike'].includes(type)) {
        return res.status(400).json({ error: "Invalid interaction type." });
    }

    try {
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ error: "Video not found" });
        }

        const existingInteraction = await Interaction.findOne({ videoId, userId });

        if (existingInteraction) {
            if (existingInteraction.type === type) {
                // User is removing their like/dislike
                await Interaction.deleteOne({ _id: existingInteraction._id });
                
                if (type === 'like') {
                    video.likeCount = Math.max(0, video.likeCount - 1);
                } else {
                    video.dislikeCount = Math.max(0, video.dislikeCount - 1);
                }
                
                await video.save();
                return res.status(200).json({ message: `${type} removed`, action: null, likeCount: video.likeCount, dislikeCount: video.dislikeCount });
            } else {
                // User is switching from like to dislike, or vice versa
                existingInteraction.type = type;
                await existingInteraction.save();
                
                if (type === 'like') {
                    video.likeCount += 1;
                    video.dislikeCount = Math.max(0, video.dislikeCount - 1);
                } else {
                    video.dislikeCount += 1;
                    video.likeCount = Math.max(0, video.likeCount - 1);
                }
                
                await video.save();
                return res.status(200).json({ message: `Switched to ${type}`, action: type, likeCount: video.likeCount, dislikeCount: video.dislikeCount });
            }
        } else {
            // New interaction
            await Interaction.create({ userId, videoId, type });
            
            if (type === 'like') {
                video.likeCount += 1;
            } else {
                video.dislikeCount += 1;
            }
            
            await video.save();
            return res.status(201).json({ message: `Added ${type}`, action: type, likeCount: video.likeCount, dislikeCount: video.dislikeCount });
        }
    } catch (error) {
        console.error("Error toggling interaction:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getInteractionStatus = async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user.id;

    try {
        const interaction = await Interaction.findOne({ videoId, userId });
        res.status(200).json({ 
            action: interaction ? interaction.type : null 
        });
    } catch (error) {
        console.error("Error fetching interaction status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
