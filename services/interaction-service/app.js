import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import interactionRoutes from "./src/routes/interactionRoutes.js";

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
    res.status(200).json({ status: "OK", service: "interaction-service" });
});

app.use("/api/interactions", interactionRoutes);

export default app;
