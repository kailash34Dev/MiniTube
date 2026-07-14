import express from "express";
import { verifyToken } from "@minitube/shared";
import { toggleInteraction, getInteractionStatus } from "../controllers/interactionController.js";

const router = express.Router();

router.post("/:videoId", verifyToken, toggleInteraction);
router.get("/:videoId/status", verifyToken, getInteractionStatus);

export default router;
