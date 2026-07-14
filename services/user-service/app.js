import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import passport from "passport";
import "./src/config/passport.js"; // Initialize passport config
import authRoutes from "./src/routes/auth.routes.js";
import subscriptionRoutes from "./src/routes/subscription.routes.js";

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
    cors({
        origin: FRONTEND_URL,
        credentials: true,
    })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());

app.use("/auth", authRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// Health check route
app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", service: "user-service" });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
});

export default app;
