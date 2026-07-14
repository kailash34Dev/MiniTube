import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import commentRoutes from "./src/routes/comment.routes.js";

const app = express();

app.use(
    cors({
        origin: "http://localhost:5173", // Allow requests from frontend
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

app.get("/health", (req, res) => {
    res.status(200).json({ status: "OK", service: "comment-service" });
});

app.use("/api/comments", commentRoutes);

export default app;
