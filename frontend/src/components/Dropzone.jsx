import { useRef, useState } from "react";
import { AlertCircle } from "lucide-react";

export default function Dropzone({
    accept = "*",
    maxSize, // in bytes
    onFileSelected,
    className = "",
    children,
}) {
    const [isDragActive, setIsDragActive] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setIsDragActive(true);
        } else if (e.type === "dragleave") {
            setIsDragActive(false);
        }
    };

    const validateAndSelectFile = (file) => {
        if (!file) return;

        if (accept && accept !== "*") {
            const acceptedTypes = accept
                .split(",")
                .map((t) => t.trim().toLowerCase());
            const fileType = file.type.toLowerCase();
            const fileExtension =
                "." + file.name.split(".").pop().toLowerCase();

            const isValidType = acceptedTypes.some((type) => {
                if (type.startsWith(".")) {
                    return type === fileExtension;
                } else if (type.endsWith("/*")) {
                    const baseType = type.split("/")[0];
                    return fileType.startsWith(baseType + "/");
                } else {
                    return type === fileType;
                }
            });

            if (!isValidType) {
                setError(`Invalid file type. Accepted: ${accept}`);
                setTimeout(() => {
                    setError(null);
                }, 3000);
                return;
            }
        }

        if (maxSize && file.size > maxSize) {
            const sizeMB = (maxSize / (1024 * 1024)).toFixed(0);
            setError(`File is too large. Maximum size is ${sizeMB}MB.`);
            setTimeout(() => {
                setError(null);
            }, 3000);
            return;
        }

        setError(null);
        onFileSelected(file);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSelectFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            validateAndSelectFile(e.target.files[0]);
        }
    };

    const onButtonClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div
            className={`upload-dropzone ${isDragActive ? "drag-active" : ""} ${className}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={onButtonClick}
            style={{ cursor: "pointer" }}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleChange}
                onClick={(e) => {
                    e.target.value = null;
                }}
                style={{ display: "none" }}
            />
            {children}
            {error && (
                <div className="dropzone-error-overlay">
                    <AlertCircle size={32} style={{ marginBottom: "8px" }} />
                    <span style={{ fontWeight: 500, fontSize: "14px" }}>
                        {error}
                    </span>
                </div>
            )}
        </div>
    );
}
