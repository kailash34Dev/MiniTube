import { useState, useEffect, useRef } from "react";
import { useBlocker, useNavigate } from "react-router-dom";
import {
    Upload as UploadIcon,
    Video,
    Image as ImageIcon,
    X,
} from "lucide-react";
import MainLayout from "../components/MainLayout";
import Dropzone from "../components/Dropzone";
import TagsInput from "../components/TagsInput";
import FormInput from "../components/FormInput";

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

const MAX_VIDEO_SIZE = 300 * 1024 * 1024; // 300MB
const MAX_THUMBNAIL_SIZE = 2 * 1024 * 1024; // 2MB

const API_BASE_URL =
    import.meta.env.VITE_UPLOAD_SERVICE_URL || "http://localhost:5001";

const uploadFileWithProgress = (url, file, onProgress, activeXhrsRef) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        if (activeXhrsRef) activeXhrsRef.current.push(xhr);

        xhr.open("PUT", url, true);
        xhr.setRequestHeader("Content-Type", file.type);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                onProgress(percentComplete);
            }
        };

        xhr.onload = () => {
            if (activeXhrsRef) {
                activeXhrsRef.current = activeXhrsRef.current.filter(
                    (x) => x !== xhr,
                );
            }
            if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
            } else {
                reject(new Error(`Upload failed with status ${xhr.status}`));
            }
        };

        xhr.onerror = () => {
            if (activeXhrsRef) {
                activeXhrsRef.current = activeXhrsRef.current.filter(
                    (x) => x !== xhr,
                );
            }
            reject(new Error("Network error during upload"));
        };

        xhr.onabort = () => {
            if (activeXhrsRef) {
                activeXhrsRef.current = activeXhrsRef.current.filter(
                    (x) => x !== xhr,
                );
            }
            reject(new Error("Upload cancelled"));
        };

        xhr.send(file);
    });
};

export default function Upload() {
    const navigate = useNavigate();
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Tech");
    const [tags, setTags] = useState([]);
    const [errors, setErrors] = useState({});
    const [videoProgress, setVideoProgress] = useState(0);
    const [thumbProgress, setThumbProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const activeXhrsRef = useRef([]);
    const isUploadingRef = useRef(false);

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            isUploadingRef.current &&
            currentLocation.pathname !== nextLocation.pathname,
    );

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (isUploadingRef.current) {
                e.preventDefault();
                e.returnValue = "";
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, []);

    useEffect(() => {
        return () => {
            if (activeXhrsRef.current.length > 0) {
                activeXhrsRef.current.forEach((xhr) => xhr.abort());
                activeXhrsRef.current = [];
            }
        };
    }, []);

    const handleUploadSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!videoFile) {
            newErrors.video = "Please select a video file to upload.";
        }
        if (!thumbnailFile) {
            newErrors.thumbnail = "Please select a thumbnail image.";
        }
        if (!title.trim()) {
            newErrors.title = "Title is required.";
        }
        if (!description.trim()) {
            newErrors.description = "Description is required.";
        } else if (description.length > 1000) {
            newErrors.description =
                "Description cannot exceed 1000 characters.";
        }
        if (tags.length === 0) {
            newErrors.tags = "At least one tag is required.";
        } else if (tags.length > 30) {
            newErrors.tags = "You can add a maximum of 10 tags.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setTimeout(() => {
                const firstError = document.querySelector(".form-error-msg");
                if (firstError) {
                    firstError.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }
            }, 100);
            return;
        }

        setErrors({});
        setUploadError(null);
        setUploadSuccess(false);
        setIsUploading(true);
        isUploadingRef.current = true;
        setVideoProgress(0);
        setThumbProgress(0);

        try {
            // 1. Initialize upload
            const initRes = await fetch(
                `${API_BASE_URL}/api/videos/upload-init`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title,
                        description,
                        category,
                        tags,
                        fileName: videoFile.name,
                        mimeType: videoFile.type,
                        size: videoFile.size,
                        thumbnailFileName: thumbnailFile.name,
                        thumbnailMimeType: thumbnailFile.type,
                    }),
                },
            );

            if (!initRes.ok) {
                const errData = await initRes.json().catch(() => ({}));
                throw new Error(
                    errData.message || "Failed to initialize upload",
                );
            }

            const { videoId, uploadUrl, thumbnailUploadUrl } =
                await initRes.json();

            // 2. Upload files concurrently
            const uploadTasks = [
                uploadFileWithProgress(
                    uploadUrl,
                    videoFile,
                    setVideoProgress,
                    activeXhrsRef,
                ),
            ];

            if (thumbnailUploadUrl) {
                uploadTasks.push(
                    uploadFileWithProgress(
                        thumbnailUploadUrl,
                        thumbnailFile,
                        setThumbProgress,
                        activeXhrsRef,
                    ),
                );
            }

            await Promise.all(uploadTasks);

            // 3. Complete upload
            const completeRes = await fetch(
                `${API_BASE_URL}/api/videos/upload-complete`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ videoId }),
                },
            );

            if (!completeRes.ok) {
                const errData = await completeRes.json().catch(() => ({}));
                throw new Error(errData.message || "Failed to complete upload");
            }

            // Success! Show toast
            setUploadSuccess(true);
            setIsUploading(false);
            isUploadingRef.current = false;

            setTimeout(() => {
                const successToast = document.querySelector(
                    ".upload-success-toast",
                );
                if (successToast) {
                    successToast.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }
            }, 100);

            setTimeout(() => {
                navigate("/dashboard");
            }, 3000);
        } catch (err) {
            setUploadError(
                err.message || "An unexpected error occurred during upload.",
            );
            setIsUploading(false);
            isUploadingRef.current = false;
            setTimeout(() => {
                const errorBanner = document.querySelector(
                    ".upload-error-banner",
                );
                if (errorBanner) {
                    errorBanner.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                    });
                }
            }, 100);
        }
    };

    return (
        <MainLayout showSidebar={false}>
            <div className="upload-page-content">
                <div className="upload-header">
                    <h1 className="video-title-large">Upload Video</h1>
                    <p className="video-meta">
                        Share your moments with the world.
                    </p>
                </div>

                {uploadError && (
                    <div className="upload-error-banner">{uploadError}</div>
                )}

                {uploadSuccess && (
                    <div className="upload-success-toast">
                        🎉 Your video has been uploaded successfully! We're
                        processing it now. You'll be redirected to your
                        dashboard...
                    </div>
                )}

                <form
                    onSubmit={handleUploadSubmit}
                    className="upload-grid-layout"
                    noValidate
                >
                    {/* Left Column: Media */}
                    <div className="upload-media-column">
                        <Dropzone
                            accept="video/*"
                            maxSize={MAX_VIDEO_SIZE}
                            onFileSelected={(file) => {
                                setVideoFile(file);
                                setErrors((prev) => ({ ...prev, video: null }));
                                setVideoProgress(0);
                            }}
                            className="large-dropzone"
                        >
                            {videoFile ? (
                                <div
                                    className="file-selected-card"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="file-info-header">
                                        <div className="file-info-left">
                                            <Video
                                                size={24}
                                                className="brand-icon"
                                            />
                                            <div className="file-details">
                                                <span className="file-name">
                                                    {videoFile.name}
                                                </span>
                                                <span className="file-size">
                                                    {(
                                                        videoFile.size /
                                                        (1024 * 1024)
                                                    ).toFixed(2)}{" "}
                                                    MB
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="icon-btn"
                                            onClick={() => setVideoFile(null)}
                                            disabled={isUploading}
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                    <div className="progress-container">
                                        <div className="progress-bar-bg">
                                            <div
                                                className="progress-bar-fill"
                                                style={{
                                                    width: `${Math.min(videoProgress, 100)}%`,
                                                }}
                                            />
                                        </div>
                                        <span className="progress-text">
                                            {isUploading
                                                ? `Uploading... ${Math.round(videoProgress)}%`
                                                : videoProgress === 100
                                                  ? "Upload complete"
                                                  : "Ready to upload"}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="dropzone-icon-wrapper">
                                        <UploadIcon size={32} />
                                    </div>
                                    <div className="upload-title">
                                        Select Video File
                                    </div>
                                    <div className="upload-subtitle">
                                        File size up to 300MB
                                    </div>
                                </>
                            )}
                        </Dropzone>
                        {errors.video && (
                            <div className="form-error-msg">{errors.video}</div>
                        )}

                        <div
                            className="form-group"
                            style={{ marginTop: "24px" }}
                        >
                            <label className="form-label">Thumbnail</label>
                            <Dropzone
                                accept="image/*"
                                maxSize={MAX_THUMBNAIL_SIZE}
                                onFileSelected={(file) => {
                                    setThumbnailFile(file);
                                    setErrors((prev) => ({
                                        ...prev,
                                        thumbnail: null,
                                    }));
                                    setThumbProgress(0);
                                }}
                                className="small-dropzone"
                            >
                                {thumbnailFile ? (
                                    <div
                                        className="file-selected-card"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="file-info-header">
                                            <div className="file-info-left">
                                                <ImageIcon
                                                    size={24}
                                                    className="brand-icon"
                                                />
                                                <div className="file-details">
                                                    <span className="file-name">
                                                        {thumbnailFile.name}
                                                    </span>
                                                    <span className="file-size">
                                                        {(
                                                            thumbnailFile.size /
                                                            (1024 * 1024)
                                                        ).toFixed(2)}{" "}
                                                        MB
                                                    </span>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="icon-btn"
                                                onClick={() =>
                                                    setThumbnailFile(null)
                                                }
                                                disabled={isUploading}
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                        <div className="progress-container">
                                            <div className="progress-bar-bg">
                                                <div
                                                    className="progress-bar-fill"
                                                    style={{
                                                        width: `${Math.min(thumbProgress, 100)}%`,
                                                    }}
                                                />
                                            </div>
                                            <span className="progress-text">
                                                {isUploading
                                                    ? `Uploading... ${Math.round(thumbProgress)}%`
                                                    : thumbProgress === 100
                                                      ? "Upload complete"
                                                      : "Ready to upload"}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <ImageIcon
                                            size={24}
                                            className="text-secondary"
                                        />
                                        <div
                                            className="upload-subtitle"
                                            style={{ margin: 0 }}
                                        >
                                            Upload thumbnail (Max 2MB)
                                        </div>
                                    </>
                                )}
                            </Dropzone>
                            {errors.thumbnail && (
                                <div className="form-error-msg">
                                    {errors.thumbnail}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="upload-details-column card">
                        <FormInput
                            label="Title"
                            placeholder="Add a title that describes your video"
                            value={title}
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (errors.title)
                                    setErrors((prev) => ({
                                        ...prev,
                                        title: null,
                                    }));
                            }}
                            error={errors.title}
                            required
                        />

                        <FormInput
                            label="Description"
                            type="textarea"
                            placeholder="Tell viewers about your video"
                            rows={6}
                            value={description}
                            onChange={(e) => {
                                setDescription(e.target.value);
                                if (errors.description)
                                    setErrors((prev) => ({
                                        ...prev,
                                        description: null,
                                    }));
                            }}
                            error={errors.description}
                            required
                        />

                        <FormInput
                            label="Category"
                            type="select"
                            options={ALLOWED_CATEGORIES}
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />

                        <div className="form-group">
                            <label className="form-label">
                                Tags{" "}
                                <span style={{ color: "var(--brand-primary)" }}>
                                    *
                                </span>
                            </label>
                            <TagsInput
                                tags={tags}
                                onChange={(newTags) => {
                                    setTags(newTags);
                                    if (errors.tags)
                                        setErrors((prev) => ({
                                            ...prev,
                                            tags: null,
                                        }));
                                }}
                                placeholder="Add tags (press Enter or comma)"
                            />
                            {errors.tags && (
                                <div
                                    className="form-error-msg"
                                    style={{ marginTop: "8px" }}
                                >
                                    {errors.tags}
                                </div>
                            )}
                        </div>

                        <div className="upload-actions">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => window.history.back()}
                                disabled={isUploading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isUploading}
                            >
                                {isUploading ? "Uploading..." : "Publish Video"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {blocker.state === "blocked" && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div
                            className="modal-header"
                            style={{ marginBottom: "16px" }}
                        >
                            Cancel Upload?
                        </div>
                        <p
                            style={{
                                color: "var(--text-secondary)",
                                fontSize: "var(--text-base)",
                                lineHeight: "1.5",
                            }}
                        >
                            You have an upload in progress. If you leave this
                            page, your upload will be cancelled and the file
                            will not be saved.
                        </p>
                        <div className="modal-footer">
                            <button
                                className="btn btn-ghost"
                                onClick={() => blocker.reset()}
                            >
                                Stay and Continue
                            </button>
                            <button
                                className="btn btn-primary"
                                style={{
                                    backgroundColor: "var(--danger)",
                                    color: "#fff",
                                }}
                                onClick={() => blocker.proceed()}
                            >
                                Cancel Upload & Leave
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
