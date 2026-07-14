import mongoose from "mongoose";

const interactionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        videoId: {
            type: String, // Video _id is a String in this system
            ref: "Video",
            required: true,
        },
        type: {
            type: String,
            enum: ["like", "dislike"],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure a user can only have one interaction (like OR dislike) per video
interactionSchema.index({ userId: 1, videoId: 1 }, { unique: true });

const Interaction = mongoose.model("Interaction", interactionSchema, "interactions");

export default Interaction;
