import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import uploadRoutes from "./routes/uploadRoutes.js";
import internalRoutes from "./routes/internalRoutes.js";

const app = express();

// App Settings & Middleware
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    }),
);
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Routes
app.use("/api/videos", uploadRoutes);
app.use("/api/internal", internalRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errors = err.errors || [];

    // Handle Mongoose Validation Errors
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = "Validation Error";
        errors = Object.values(err.errors).map(val => val.message);
    } else if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid ${err.path}: ${err.value}`;
    }

    if (statusCode === 500) {
        console.error(`[Unhandled Error]`, err);
    } else {
        console.error(`[ApiError] ${statusCode} - ${message}`);
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        errors: errors,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
});

export default app;
