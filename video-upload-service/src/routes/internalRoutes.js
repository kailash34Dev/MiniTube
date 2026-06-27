import express from "express";
import {
    getInternalVideo,
    updateInternalVideo,
} from "../controllers/internalController.js";

const router = express.Router();

router.get("/videos/:id", getInternalVideo);
router.put("/videos/:id", updateInternalVideo);

export default router;
