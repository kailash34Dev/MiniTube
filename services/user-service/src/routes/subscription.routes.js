import { Router } from "express";
import { verifyToken } from "@minitube/shared";
import {
    toggleSubscription,
    checkSubscriptionStatus,
    getChannelProfile,
} from "../controllers/subscription.controller.js";

const router = Router();

router.post("/:channelId", verifyToken, toggleSubscription);
router.get("/:channelId/status", verifyToken, checkSubscriptionStatus);
router.get("/:channelId/profile", getChannelProfile);

export default router;
