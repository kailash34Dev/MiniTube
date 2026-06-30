import express from "express";
import cors from "cors";
import streamingRoutes from "./routes/streamingRoutes.js";

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN || "*",
        credentials: true,
    }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/videos", streamingRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";

    if (statusCode === 500) {
        console.error(`[Unhandled Error]`, err);
    } else {
        console.error(`[ApiError] ${statusCode} - ${message}`);
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
});

export default app;
