import { Router } from "express";
import { verifyToken } from "@minitube/shared";
import {
    addComment,
    getComments,
} from "../controllers/comment.controller.js";

const router = Router();

router.get("/:videoId", getComments);
router.post("/:videoId", verifyToken, addComment);

export default router;
