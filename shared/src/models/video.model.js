import mongoose from "mongoose";

const ALLOWED_CATEGORIES = [
    "Tech",
    "Gaming",
    "Education",
    "Music",
    "Entertainment",
    "Vlogs",
    "Sports",
    "News",
    "Comedy",
    "Other",
];

const videoSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            required: true,
        },
        creatorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        creatorName: {
            type: String,
            required: true,
        },
        creatorProfilePicture: {
            type: String,
            required: true,
        },
        thumbnail_path: {
            type: String,
            required: true,
        },
        upload_path: {
            type: String,
            required: true,
        },
        mime_type: {
            type: String,
            required: true,
        },
        actual_size: {
            type: Number,
            required: true,
        },
        processed_size: {
            type: Number,
            default: null,
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            enum: ALLOWED_CATEGORIES,
        },
        tags: {
            type: [
                {
                    type: String,
                    required: true,
                },
            ],
            default: [],
        },
        status: {
            type: String,
            required: true,
            enum: ["uploading", "processing", "published", "failed"],
        },
        duration: {
            type: Number,
            default: null,
        },
        views: {
            type: Number,
            default: 0,
        },
        likeCount: {
            type: Number,
            default: 0,
        },
        dislikeCount: {
            type: Number,
            default: 0,
        },
        width: {
            type: Number,
            default: null,
        },
        height: {
            type: Number,
            default: null,
        },
        hls_path: {
            type: String,
            default: null,
        },
        error_message: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: {
            createdAt: "created_at",
            updatedAt: "updated_at",
        },
    },
);

videoSchema.virtual("id").get(function () {
    return this._id;
});
videoSchema.set("toJSON", { virtuals: true });
videoSchema.set("toObject", { virtuals: true });

const Video = mongoose.model("Video", videoSchema, "videos");

export default Video;
