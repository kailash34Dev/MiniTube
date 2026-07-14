import { Router } from "express";
import passport from "passport";
import { googleCallback, logout, getCurrentUser } from "../controllers/auth.controller.js";

const router = Router();

// Route to initiate Google OAuth
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// Google OAuth callback route
router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login` }),
    googleCallback
);

// Route to logout
router.post("/logout", logout);

// Route to get the current authenticated user (requires middleware in a real scenario to verify JWT)
// For simplicity, this is just a placeholder. You'd typically use a verifyJWT middleware here.
router.get("/me", getCurrentUser);

export default router;
