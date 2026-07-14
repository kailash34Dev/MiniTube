import { Comment, User, asyncHandler, ApiError } from "@minitube/shared";

// Add a comment or reply
export const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { text, parentCommentId } = req.body;
    const authorId = req.user.id;

    if (!text || text.trim() === "") {
        throw new ApiError(400, "Comment text is required");
    }

    if (parentCommentId) {
        const parentComment = await Comment.findById(parentCommentId);
        if (!parentComment) {
            throw new ApiError(404, "Parent comment not found");
        }
        
        // Enforce 1-level nesting
        if (parentComment.parentCommentId) {
            throw new ApiError(400, "Replies cannot have nested replies");
        }
    }

    const newComment = await Comment.create({
        videoId,
        authorId,
        text,
        parentCommentId: parentCommentId || null,
    });

    const populatedComment = await Comment.findById(newComment._id).populate(
        "authorId",
        "displayName profilePicture"
    );

    res.status(201).json({
        success: true,
        comment: populatedComment,
    });
});

// Get comments and replies for a video
export const getComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    // Fetch all comments for this video
    const allComments = await Comment.find({ videoId })
        .populate("authorId", "displayName profilePicture")
        .sort({ createdAt: -1 })
        .lean();

    // Separate main comments and replies
    const mainComments = [];
    const repliesMap = {}; // Maps parentCommentId to an array of replies

    for (const comment of allComments) {
        if (!comment.parentCommentId) {
            mainComments.push({ ...comment, replies: [] });
        } else {
            const parentId = comment.parentCommentId.toString();
            if (!repliesMap[parentId]) {
                repliesMap[parentId] = [];
            }
            repliesMap[parentId].push(comment);
        }
    }

    // Attach replies to main comments
    for (const mainComment of mainComments) {
        const parentId = mainComment._id.toString();
        if (repliesMap[parentId]) {
            // Sort replies ascending so oldest is first
            mainComment.replies = repliesMap[parentId].sort(
                (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );
        }
    }

    res.status(200).json({
        success: true,
        comments: mainComments,
    });
});
