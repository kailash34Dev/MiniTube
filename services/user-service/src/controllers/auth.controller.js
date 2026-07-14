import jwt from "jsonwebtoken";
import { asyncHandler } from "@minitube/shared";

const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET || "fallback_secret",
        {
            expiresIn: "7d",
        },
    );
};

export const googleCallback = asyncHandler(async (req, res) => {
    // User is available in req.user from passport
    const user = req.user;

    const token = generateToken(user._id);

    const isProduction = process.env.NODE_ENV === "production";

    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax", // 'none' is needed for cross-site cookies if frontend and backend are on different domains in prod
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    };

    res.cookie("token", token, cookieOptions);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}`);
});

export const logout = asyncHandler(async (req, res) => {
    const isProduction = process.env.NODE_ENV === "production";

    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
    };

    res.clearCookie("token", cookieOptions);
    res.status(200).json({ success: true, message: "Logged out successfully" });
});

// A simple controller to get the current user.
// In a real app, you would have a middleware that verifies the JWT from the cookie
// and sets req.user to the decoded user.
export const getCurrentUser = asyncHandler(async (req, res) => {
    const token = req.cookies?.token;

    if (!token) {
        return res
            .status(401)
            .json({ success: false, message: "Not authenticated" });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || "fallback_secret",
        );
        const { User } = await import("@minitube/shared");
        const user = await User.findById(decoded.id);

        if (!user) {
            return res
                .status(404)
                .json({ success: false, message: "User not found" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(401).json({ success: false, message: "Invalid token" });
    }
});
