import express from "express";
import { uploadInit, uploadComplete } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/upload-init", uploadInit);
router.post("/upload-complete", uploadComplete);

export default router;
