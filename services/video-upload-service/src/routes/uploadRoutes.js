import express from "express";
import { verifyToken } from "@minitube/shared";
import { uploadInit, uploadComplete } from "../controllers/uploadController.js";

const router = express.Router();

router.post("/upload-init", verifyToken, uploadInit);
router.post("/upload-complete", uploadComplete);

export default router;
